---
name: commit
description: Generate and create Conventional Commits from Git changes. Use when the user asks Codex to commit current work, generate a commit message, create a conventional commit, or convert staged/unstaged repository changes into a professional Git commit.
---

# Commit

Create a Git commit with a professional Conventional Commits message based on the current repository changes.

## Workflow

1. Inspect the changed area at a high level without reading unrelated files.
2. Use `git diff` to understand the actual changes.
3. If staged changes exist, treat the staged set as the user's explicit selection and commit only those changes.
4. If no changes are staged, stage the relevant uncommitted changes explicitly with `git add`.
5. Generate a Conventional Commits message.
6. Run `git commit` with the generated message.
7. Do not amend existing commits and do not push.

## Allowed Git Commands

Use only these command categories for the commit workflow:

- `git diff` to inspect changes.
- `git add` to stage relevant files when nothing is already staged.
- `git commit` to create the commit.

Do not run `git status` or `git log` if the user already provided that information. If repository state is not known in the current turn, use the minimum Git inspection needed before committing.

## Commit Message Format

Follow this structure:

```text
<type>[optional scope]: <description>

<body>

[optional footer(s)]
```

Use one of these primary types:

- `feat`: New feature or functionality.
- `fix`: Bug fix or error correction.
- `ui`: CSS or component style changes only.
- `perf`: Performance or UX improvements.
- `refactor`: Code refactoring without feature changes or bug fixes.

Use these extended types when they fit better:

- `docs`: Documentation changes only.
- `style`: Code style changes such as whitespace, formatting, or semicolons.
- `test`: Adding or fixing tests.
- `build`: Build system or external dependency changes.
- `ci`: CI/CD configuration changes.
- `chore`: Maintenance tasks or tooling changes.
- `revert`: Reverting previous commits.

## Message Rules

- Use an optional lowercase scope in parentheses, such as `feat(api):` or `fix(ui):`.
- Common scopes include `api`, `ui`, `auth`, `db`, `config`, `deps`, and `docs`.
- Write the description in imperative mood.
- Start the description with a lowercase letter.
- Do not end the description with a period.
- Keep the description at or below 100 characters.
- Match the description's specificity to the true size of the change.
- For broad changes, summarize at the feature, module, or page level.
- For small isolated changes, describe the concrete edit.
- Prefer the user's stated intent when provided, but combine it with the actual diff.
- Do not mechanically restate fragmented or incomplete user wording.

## Body And Footer

Include a body for significant or complex changes. Explain what changed and why, not implementation minutiae. Wrap body lines at about 72 characters.

Use footers only when appropriate. For breaking changes, include:

```text
BREAKING CHANGE: description
```

## Execution

When running the commit, pass the message with real newlines using standard input:

```sh
git commit -F - <<'EOF'
type(scope): description

Body text when needed.
EOF
```

Do not use `-m` with `git commit -F`. Do not put textual `\n` sequences inside a message string to simulate line breaks.

If creating the commit is impossible, output only the final commit message text so the user can use it directly.

- Write the commit message in Simplified Chinese.
- Keep proper nouns, product names, framework names, command names, file names,
  API names, technical abbreviations, and Conventional Commits type/scope text
  in their original language. For example, write `添加 commit skill` instead of
  translating `commit` or `skill`.
