import json
from datetime import datetime, timezone

from neo4j import GraphDatabase
from screenmind.config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
except Exception:
    driver = None


def init_graph():
    """Create indexes on Topic.name and App.name."""
    if driver is None:
        return
    try:
        with driver.session() as session:
            session.run("CREATE INDEX IF NOT EXISTS FOR (t:Topic) ON (t.name)")
            session.run("CREATE INDEX IF NOT EXISTS FOR (a:App) ON (a.name)")
    except Exception as exc:
        print(f"[graph] init_graph failed: {exc}")


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
    """Find topics matching a query, return as JSON string."""
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
        return json.dumps(topics, indent=2, default=str)
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
