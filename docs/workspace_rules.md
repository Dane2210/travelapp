Workspace Rules

Naming Conventions
Folders & files: Use lowercase with hyphens
Example: flight-search, trip-estimator.js

Branches
feature/<name> – For new features (e.g., feature/price-alerts)
bugfix/<name> – For fixing bugs (e.g., bugfix/login-crash)
docs/<name> – For documentation changes (e.g., docs/prd-update)

Variables & functions: Use camelCase
Components (React): Use PascalCase

Commit Message Guidelines
Follow the Conventional Commits format
<type>: <short message>

Allowed types
feat: new feature
fix: bug fix
docs: documentation changes
refactor: code restructure (no behavior change)
style: UI or formatting only
test: adding or updating tests
chore: non-code task (e.g., config, build)

Examples
feat: add flight search form
fix: handle empty destination field
docs: update PRD with trip cost logic

Pull Request & Review Process
Create a pull request (PR) for every feature branch
Assign at least one teammate as a reviewer
Reviewer must approve before merging
Use the PR description to link tasks or user stories (e.g., "Closes #3 – US-01 Flight Search")
Add screenshots or test results when possible

Branching Strategy
Default Branch: main
Use a simple Git Flow Lite
Work from feature branches created off of main
PRs must be merged into main via review
Delete feature branches after merge
Never commit directly to main