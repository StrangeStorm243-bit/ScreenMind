import json
from datetime import datetime, timedelta, timezone

from neo4j import GraphDatabase
from screenmind.config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
except Exception:
    driver = None

# Track whether full-text index is available
_has_fulltext = None


def init_graph():
    """Create indexes on Topic.name, App.name, and ScreenCapture nodes."""
    global _has_fulltext
    if driver is None:
        return
    try:
        with driver.session() as session:
            session.run("CREATE INDEX IF NOT EXISTS FOR (t:Topic) ON (t.name)")
            session.run("CREATE INDEX IF NOT EXISTS FOR (a:App) ON (a.name)")
            session.run("CREATE INDEX IF NOT EXISTS FOR (s:ScreenCapture) ON (s.timestamp)")
            # Try full-text index for relevance-scored search
            try:
                session.run(
                    "CREATE FULLTEXT INDEX screen_fulltext IF NOT EXISTS "
                    "FOR (s:ScreenCapture) ON EACH [s.description, s.activity]"
                )
                _has_fulltext = True
            except Exception:
                _has_fulltext = False
    except Exception as exc:
        print(f"[graph] init_graph failed: {exc}")


def store_screen_capture(
    description: str,
    activity: str,
    entities: dict,
    timestamp: str | None = None,
) -> str:
    """Store a full screen description as a ScreenCapture node in Neo4j,
    linked to extracted entity Topic nodes via MENTIONS relationships."""
    if driver is None:
        return "Memory unavailable"

    now = timestamp or datetime.now(timezone.utc).isoformat()

    try:
        with driver.session() as session:
            # Create the ScreenCapture node
            result = session.run(
                """
                CREATE (s:ScreenCapture {
                    description: $description,
                    activity: $activity,
                    timestamp: $timestamp
                })
                RETURN elementId(s) AS node_id
                """,
                description=description,
                activity=activity,
                timestamp=now,
            )
            capture_id = result.single()["node_id"]

            # Link to entity Topic nodes via MENTIONS
            entity_map = entities.get("entities", {})
            for entity_type, items in entity_map.items():
                for item in items:
                    name = item if isinstance(item, str) else item.get("text", "")
                    if name and len(name) > 1:
                        session.run(
                            """
                            MERGE (t:Topic {name: $name})
                            ON CREATE SET
                                t.category = $category,
                                t.first_seen = $now,
                                t.last_seen = $now,
                                t.mention_count = 1,
                                t.details = $details
                            ON MATCH SET
                                t.last_seen = $now,
                                t.mention_count = t.mention_count + 1
                            WITH t
                            MATCH (s:ScreenCapture)
                            WHERE elementId(s) = $capture_id
                            MERGE (s)-[:MENTIONS]->(t)
                            """,
                            name=name,
                            category=entity_type,
                            now=now,
                            details=f"Seen on screen ({entity_type})",
                            capture_id=capture_id,
                        )

        return "ok"
    except Exception as exc:
        return f"Memory unavailable: {exc}"


def retrieve_relevant_context(
    query: str,
    entity_names: list[str] | None = None,
    limit: int = 5,
) -> list[dict]:
    """Retrieve relevant ScreenCapture descriptions using hybrid search.

    Strategy 1: Entity match — find ScreenCaptures linked to query entities
    Strategy 2: Full-text search (or CONTAINS fallback) on description text
    Deduplicate and return ranked results.
    """
    if driver is None:
        return []

    results = {}  # keyed by elementId to deduplicate

    try:
        with driver.session() as session:
            # Strategy 1: Entity-based graph traversal
            if entity_names:
                records = session.run(
                    """
                    UNWIND $names AS entity_name
                    MATCH (t:Topic)
                    WHERE toLower(t.name) CONTAINS toLower(entity_name)
                    MATCH (s:ScreenCapture)-[:MENTIONS]->(t)
                    RETURN DISTINCT
                        elementId(s) AS id,
                        s.description AS description,
                        s.activity AS activity,
                        s.timestamp AS timestamp,
                        collect(DISTINCT t.name) AS matched_entities,
                        count(DISTINCT t) AS entity_hits
                    ORDER BY entity_hits DESC, s.timestamp DESC
                    LIMIT $limit
                    """,
                    names=entity_names,
                    limit=limit,
                )
                for record in records:
                    rec = dict(record)
                    rec["score"] = rec.pop("entity_hits", 1) * 10
                    results[rec["id"]] = rec

            # Strategy 2: Full-text or CONTAINS search
            if _has_fulltext:
                try:
                    records = session.run(
                        """
                        CALL db.index.fulltext.queryNodes("screen_fulltext", $query)
                        YIELD node, score
                        OPTIONAL MATCH (node)-[:MENTIONS]->(t:Topic)
                        RETURN
                            elementId(node) AS id,
                            node.description AS description,
                            node.activity AS activity,
                            node.timestamp AS timestamp,
                            collect(DISTINCT t.name) AS matched_entities,
                            score
                        ORDER BY score DESC
                        LIMIT $limit
                        """,
                        query=query,
                    )
                    for record in records:
                        rec = dict(record)
                        eid = rec["id"]
                        if eid in results:
                            results[eid]["score"] += rec.get("score", 0)
                        else:
                            results[eid] = rec
                except Exception:
                    pass  # fall through to CONTAINS

            # Fallback: CONTAINS-based text search
            if not _has_fulltext or not results:
                records = session.run(
                    """
                    MATCH (s:ScreenCapture)
                    WHERE toLower(s.description) CONTAINS toLower($query)
                    OPTIONAL MATCH (s)-[:MENTIONS]->(t:Topic)
                    RETURN
                        elementId(s) AS id,
                        s.description AS description,
                        s.activity AS activity,
                        s.timestamp AS timestamp,
                        collect(DISTINCT t.name) AS matched_entities,
                        1.0 AS score
                    ORDER BY s.timestamp DESC
                    LIMIT $limit
                    """,
                    query=query,
                )
                for record in records:
                    rec = dict(record)
                    eid = rec["id"]
                    if eid not in results:
                        results[eid] = rec

        # Sort by score then recency
        sorted_results = sorted(
            results.values(),
            key=lambda x: (x.get("score", 0), x.get("timestamp", "")),
            reverse=True,
        )
        for r in sorted_results:
            r.pop("id", None)
        return sorted_results[:limit]

    except Exception:
        return []


def cleanup_old_captures(max_age_hours: int = 24) -> int:
    """Delete ScreenCapture nodes older than max_age_hours. Returns count deleted."""
    if driver is None:
        return 0
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=max_age_hours)).isoformat()
        with driver.session() as session:
            result = session.run(
                """
                MATCH (s:ScreenCapture)
                WHERE s.timestamp < $cutoff
                DETACH DELETE s
                RETURN count(s) AS deleted
                """,
                cutoff=cutoff,
            )
            return result.single()["deleted"]
    except Exception:
        return 0


def remember_topic(
    topic: str, category: str, details: str, related_to: list[str] | None = None
) -> str:
    """Store or update a topic in the knowledge graph."""
    if driver is None:
        return "Memory unavailable"
    now = datetime.now(timezone.utc).isoformat()

    try:
        with driver.session() as session:
            session.run(
                """
                MERGE (t:Topic {name: $topic})
                ON CREATE SET
                    t.first_seen = $now,
                    t.last_seen = $now,
                    t.mention_count = 1,
                    t.details = $details,
                    t.category = $category
                ON MATCH SET
                    t.last_seen = $now,
                    t.mention_count = t.mention_count + 1,
                    t.details = $details,
                    t.category = $category
                """,
                topic=topic, now=now, details=details, category=category,
            )

            if related_to:
                for related in related_to:
                    session.run(
                        """
                        MERGE (t:Topic {name: $topic})
                        MERGE (r:Topic {name: $related})
                        MERGE (t)-[:RELATED_TO]->(r)
                        """,
                        topic=topic, related=related,
                    )
    except Exception as exc:
        return f"Memory unavailable: {exc}"

    return f"Remembered: {topic} ({category})"


def recall_topics(query: str) -> str:
    """Find topics AND relevant screen captures matching a query."""
    if driver is None:
        return "No memory available"
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Topic)
                WHERE toLower(t.name) CONTAINS toLower($query)
                   OR toLower(t.details) CONTAINS toLower($query)
                OPTIONAL MATCH (t)-[:RELATED_TO]->(r:Topic)
                RETURN t.name AS name, t.category AS category,
                       t.details AS details, t.last_seen AS last_seen,
                       t.mention_count AS mention_count,
                       collect(r.name) AS related
                ORDER BY t.last_seen DESC
                LIMIT 10
                """,
                query=query,
            )
            topics = [dict(record) for record in result]

        # Also get relevant screen captures
        captures = retrieve_relevant_context(query, limit=3)
        response = {
            "topics": topics,
            "screen_captures": [
                {
                    "description": c["description"],
                    "activity": c.get("activity", ""),
                    "timestamp": c.get("timestamp", ""),
                }
                for c in captures
            ],
        }
        return json.dumps(response, indent=2, default=str)
    except Exception:
        return "No memory available"


def get_recent_context(limit: int = 20) -> list[dict]:
    """Return the most recent topics with their related topics."""
    if driver is None:
        return []
    try:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (t:Topic)
                OPTIONAL MATCH (t)-[:RELATED_TO]->(r:Topic)
                RETURN t.name AS name, t.category AS category,
                       t.details AS details, t.last_seen AS last_seen,
                       t.mention_count AS mention_count,
                       collect(r.name) AS related
                ORDER BY t.last_seen DESC
                LIMIT $limit
                """,
                limit=limit,
            )
            return [dict(record) for record in result]
    except Exception:
        return []


def close():
    """Close the Neo4j driver connection."""
    if driver is not None:
        driver.close()
