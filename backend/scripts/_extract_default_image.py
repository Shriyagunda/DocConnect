import json
import re
from pathlib import Path

src = Path(__file__).resolve().parents[1] / "models" / "userModel.js"
text = src.read_text(encoding="utf-8")
match = re.search(r"default: '(data:image/png;base64,[^']+)'", text)
if not match:
    raise SystemExit("Could not extract default user image")
out = Path(__file__).resolve().parents[1] / "models" / "defaultUserImage.js"
out.write_text(
    "export const DEFAULT_USER_IMAGE = " + json.dumps(match.group(1)) + ";\n",
    encoding="utf-8",
)
print("wrote", out, "chars", len(match.group(1)))
