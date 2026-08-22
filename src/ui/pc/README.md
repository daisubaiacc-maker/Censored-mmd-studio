# PC UI

PC-specific UI layer.

The existing desktop controls remain the reference implementation. Mobile UI must not be implemented by resizing or rearranging this layer.

Future work:
- Move desktop toolbar/panel markup here.
- Keep desktop-specific interaction wiring here.
- Share only Studio state/services with the mobile UI.
