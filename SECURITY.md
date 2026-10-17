# Security

pocketview draws untrusted JSON, YAML and Markdown. Strings are always
inserted as text, and Markdown is rendered without raw HTML and sanitized
with DOMPurify. If you find a way around that, or any other vulnerability,
please report it privately through GitHub:
https://github.com/frobnitzem/pocketview/security/advisories/new

Fixes go into the latest release.
