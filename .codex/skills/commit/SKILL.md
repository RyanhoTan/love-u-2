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
5. Generate a Conventional Commits message, using a bullet-point body when the change spans multiple edits.
6. Run `git commit` with the generated message.
7. Immediately verify the newly created commit message for encoding issues by inspecting `HEAD`.
8. If the message is garbled, rewrite only the commit you just created with a UTF-8 message file and `git commit --amend -F`.
9. Do not amend older existing commits and do not push.

## Allowed Git Commands

Use only these command categories for the commit workflow:

- `git diff` to inspect changes.
- `git add` to stage relevant files when nothing is already staged.
- `git commit` to create the commit.
- `git cat-file -p HEAD` to verify the final stored commit message.

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
- When a body is needed, use short bullet points instead of prose paragraphs.

## Body And Footer

- Write the commit message in Simplified Chinese.

For significant or complex changes, include a bullet-point body. Each bullet should describe one concrete change or reason, not implementation minutiae. Wrap body lines at about 72 characters.

Use footers only when appropriate. For breaking changes, include:

```text
BREAKING CHANGE: description
```

## Execution

When running the commit, pass the message with real newlines using standard input:

```sh
git commit -F - <<'EOF'
refactor(album): 统一媒体数据来源

- 将故事列表、标题获取和媒体获取逻辑统一迁移至 `app/data/mock-stories.ts`
- 修改相册列表组件和详情页组件从新文件独立导入数据
- 修改 `AllMedias` 组件复用新抽离的数据，消除了重复定义的数组
EOF
```

Do not use `-m` with `git commit -F`. Do not put textual `\n` sequences inside a message string to simulate line breaks.

When the commit message contains non-ASCII text, prefer writing the message to a UTF-8 file and passing it with `git commit -F <file>`. After committing, always inspect `git cat-file -p HEAD` to confirm the stored message is not garbled.

If the just-created commit message is garbled, fix it immediately by rewriting only `HEAD` with a UTF-8 message file:

```sh
git -c i18n.commitEncoding=utf-8 commit --amend -F .git-commit-message.txt
git cat-file -p HEAD
```

If creating the commit is impossible, output only the final commit message text so the user can use it directly.

- Write the commit message in Simplified Chinese.
- Keep proper nouns, product names, framework names, command names, file names,
  API names, technical abbreviations, and Conventional Commits type/scope text
  in their original language. For example, write `添加 commit skill` instead of
  translating `commit` or `skill`.
