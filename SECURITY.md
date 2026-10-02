# Security Policy

## Reporting a vulnerability

Please **do not open a public issue or pull request** for a security problem.

Email **security@elpino.chat** with:

- what you found and where (page, API route or file);
- steps to reproduce, and the impact you believe it has;
- any proof of concept, kept minimal and free of real customer data.

A person on the team reads every report. We aim to acknowledge within 3 business days, keep you updated as we
investigate, and tell you when it is fixed. Please give us a reasonable chance to fix an issue before you
disclose it anywhere.

## Scope

In scope: the code in this repository (the website, dashboard, chat widget and `tag.js` loader, and the API
route handlers) and the deployed product at `elpino.chat`.

Out of scope: denial-of-service and volumetric testing, social engineering of staff or customers, physical
attacks, third-party services we depend on (report those to the vendor), and findings that need a rooted device
or a compromised account.

## Good-faith testing

Test only against accounts and workspaces you own. Do not access, change or retain other people's data, and stop
and tell us if you reach it by accident. If you follow this policy we will not pursue legal action over your
research.

## If you find a secret in the repository

Tell us at the address above right away, even if it looks expired. It will be rotated. Note that Firebase *web*
configuration values (the `NEXT_PUBLIC_FIREBASE_*` identifiers) are public by design and are not secrets.
