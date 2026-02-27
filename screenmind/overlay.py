"""ScreenMind overlay — always-on-top chat window."""

import threading
import tkinter as tk
from tkinter.scrolledtext import ScrolledText


class Overlay:
    def __init__(self, on_submit=None):
        self.on_submit = on_submit

        self.root = tk.Tk()
        self.root.title("ScreenMind")
        self.root.geometry("380x500+50+50")
        self.root.attributes("-topmost", True)
        self.root.configure(bg="#1a1a2e")
        self.root.resizable(True, True)

        # X button hides instead of quitting (background capture keeps running)
        self.root.protocol("WM_DELETE_WINDOW", self._on_minimize)
        # Ctrl+Q to actually quit
        self.root.bind("<Control-q>", lambda _: self._on_quit())

        font = ("Consolas", 10)
        bg = "#1a1a2e"
        chat_bg = "#16213e"
        fg = "#e0e0e0"
        accent = "#00d4ff"

        # Title bar with minimize/quit controls
        title_frame = tk.Frame(self.root, bg=bg)
        title_frame.pack(fill="x", padx=8, pady=(8, 0))

        title_label = tk.Label(
            title_frame,
            text="ScreenMind",
            font=("Consolas", 12, "bold"),
            bg=bg,
            fg=fg,
        )
        title_label.pack(side="left")

        quit_btn = tk.Button(
            title_frame,
            text="Quit",
            font=("Consolas", 8),
            bg="#ff4444",
            fg="#ffffff",
            activebackground="#cc0000",
            relief="flat",
            command=self._on_quit,
        )
        quit_btn.pack(side="right", padx=(4, 0))

        hide_btn = tk.Button(
            title_frame,
            text="Hide",
            font=("Consolas", 8),
            bg="#444466",
            fg="#e0e0e0",
            activebackground="#555577",
            relief="flat",
            command=self._on_minimize,
        )
        hide_btn.pack(side="right")

        # Status label
        self._status_var = tk.StringVar(value="Idle")
        status_label = tk.Label(
            self.root,
            textvariable=self._status_var,
            font=font,
            bg=bg,
            fg=accent,
            anchor="w",
        )
        status_label.pack(fill="x", padx=8, pady=(8, 4))

        # Chat display
        self.chat_display = ScrolledText(
            self.root,
            font=font,
            bg=chat_bg,
            fg=fg,
            insertbackground=fg,
            state="disabled",
            wrap="word",
            relief="flat",
            borderwidth=0,
        )
        self.chat_display.pack(fill="both", expand=True, padx=8, pady=4)

        # Input frame
        input_frame = tk.Frame(self.root, bg=bg)
        input_frame.pack(fill="x", padx=8, pady=(4, 8))

        self.input_field = tk.Entry(
            input_frame,
            font=font,
            bg=chat_bg,
            fg=fg,
            insertbackground=fg,
            relief="flat",
            borderwidth=4,
        )
        self.input_field.pack(side="left", fill="x", expand=True, padx=(0, 4))
        self.input_field.bind("<Return>", lambda _: self._on_send())

        send_btn = tk.Button(
            input_frame,
            text="Send",
            font=font,
            bg=accent,
            fg="#1a1a2e",
            activebackground="#00b8d9",
            activeforeground="#1a1a2e",
            relief="flat",
            command=self._on_send,
        )
        send_btn.pack(side="right")

    # ------------------------------------------------------------------

    def _on_send(self):
        text = self.input_field.get().strip()
        if not text:
            return
        self.input_field.delete(0, "end")
        self.add_message(f"You: {text}")
        self.set_status("Thinking...")

        t = threading.Thread(target=self._handle_submit, args=(text,), daemon=True)
        t.start()

    def _handle_submit(self, text):
        if self.on_submit is None:
            return
        try:
            # Pass overlay so the callback can stream directly into the chat
            response = self.on_submit(text, overlay=self)
            # If streaming was used, the message is already in the chat.
            # If fallback returned a string, add it.
            if response and not hasattr(self, '_streamed'):
                pass  # streaming handler already wrote to chat
        except Exception as exc:
            self.add_message(f"ScreenMind: [error] {exc}")
        finally:
            self.set_status("Idle")

    # ------------------------------------------------------------------

    def add_message(self, message):
        """Thread-safe: append a message to the chat display."""

        def _insert():
            self.chat_display.configure(state="normal")
            self.chat_display.insert("end", message + "\n\n")
            self.chat_display.see("end")
            self.chat_display.configure(state="disabled")

        self.root.after(0, _insert)

    def start_message(self, prefix="ScreenMind: "):
        """Thread-safe: start a new streaming message. Returns nothing — call append_to_message() next."""

        def _start():
            self.chat_display.configure(state="normal")
            self.chat_display.insert("end", prefix)
            self.chat_display.see("end")
            self.chat_display.configure(state="disabled")

        self.root.after(0, _start)

    def append_to_message(self, text):
        """Thread-safe: append a text chunk to the current streaming message."""

        def _append():
            self.chat_display.configure(state="normal")
            self.chat_display.insert("end", text)
            self.chat_display.see("end")
            self.chat_display.configure(state="disabled")

        self.root.after(0, _append)

    def end_message(self):
        """Thread-safe: finalize the streaming message with trailing newlines."""

        def _end():
            self.chat_display.configure(state="normal")
            self.chat_display.insert("end", "\n\n")
            self.chat_display.see("end")
            self.chat_display.configure(state="disabled")

        self.root.after(0, _end)

    def set_status(self, status):
        """Thread-safe: update the status label."""
        self.root.after(0, lambda: self._status_var.set(status))

    def _on_minimize(self):
        """Hide the overlay window. Background capture keeps running."""
        self.root.withdraw()

    def _on_quit(self):
        """Fully exit the application."""
        self.root.destroy()

    def show(self):
        """Restore the overlay window after being hidden."""
        self.root.deiconify()
        self.root.lift()

    def run(self):
        self.root.mainloop()
