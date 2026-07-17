---
name: commit
description: Generate and create Conventional Commits from Git changes. Use when the user asks Codex to commit current work, generate a commit message, create a conventional commit, or convert staged/unstaged repository changes into a professional Git commit.
---

# Commit

Create a Git commit with a professional Conventional Commits message based on the current repository changes.

## Workflow

1. Inspect the changed area at a high level without reading unrelated files.
2. Use `git diff` to understand the actual changes relative to the current `HEAD`, and write the commit message from that diff rather than from the user's wording alone.
3. If staged changes exist, treat the staged set as the user's explicit selection and commit only those changes.
4. If no changes are staged, stage the relevant uncommitted changes explicitly with `git add`.
5. Generate a Conventional Commits message, using a bullet-point body when the change spans multiple edits.
6. Run `git commit` with the generated message.
7. Immediately verify the newly created commit message for encoding issues by inspecting `HEAD`.
8. If the message is garbled, rewrite only the commit you just created with a UTF-8 message file and `git commit --amend -F`.
9. Treat `.git-commit-message.txt` as a local temporary file only. Never stage it, never include it in the commit, and never treat it as part of the product change.
10. After the commit flow is finished, delete `.git-commit-message.txt`.
11. Do not amend older existing commits and do not push.

## Encoding Safety

Treat commit-message encoding as a reliability-critical step.

- Do not trust PowerShell console rendering alone when judging whether Chinese text is stored correctly.
- Prefer creating `.git-commit-message.txt` with `apply_patch` so the message text is written exactly as intended.
- Treat `.git-commit-message.txt` as a temporary commit-only artifact, not as a repository change to be versioned.
- Avoid generating the final message file through PowerShell string literals, `Set-Content`, `Out-File`, or ad-hoc shell pipelines when the message contains Chinese text, because these frequently introduce BOMs, `?` replacement characters, or escaped `\\u` sequences.
- If you must rewrite the message file programmatically, verify the file contents before committing and prefer a method that writes plain UTF-8 text without transformation.
- If `git commit` output looks correct but `git cat-file -p HEAD` looks wrong, assume the terminal may be misrendering and verify the actual message file or other raw artifact before amending repeatedly.
- If the message file itself contains `?` replacement characters or literal `\\uXXXX` sequences, treat that as a real corruption bug and regenerate the file before amending.
- Keep a narrow loop: write message file, commit or amend once, inspect once, fix only if the stored content is truly wrong, then delete the temporary file.

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
- Base the final title and body on what changed compared with the previous commit, not on a paraphrase of the user's request.
- If the user's request and the actual diff differ in scope, describe the actual diff.
- Do not mechanically restate fragmented or incomplete user wording.
- When a body is needed, use short bullet points instead of prose paragraphs.
- Choose the commit `type` and summary from the dominant outcome of the full change set, not just the last debugging step.
- If a change introduces a new endpoint, new data flow, or new page-level capability and also includes follow-up fixes discovered during implementation, prefer `feat` unless the net result is only a bug correction.
- Do not downscope a commit to `fix` merely because part of the work involved correcting mistakes found before the commit was created.
- Before finalizing the message, sanity-check: "If I read only this commit title later, would I understand the main thing that was added or changed?"

## Body And Footer

- Write the commit message in Simplified Chinese.

For significant or complex changes, include a bullet-point body. Each bullet should describe one concrete change or reason, not implementation minutiae. Wrap body lines at about 72 characters.

When the change set mixes feature work and corrective follow-up:

- Put the feature addition in the title if it is the primary outcome.
- Put the corrective details in the body bullets.
- Use `fix` only when the commit's main effect is restoring or correcting existing behavior.

Before committing, do a final diff-based check:

- Ask "What would a teammate learn from `git show --stat` and the patch?"
- Make the commit message answer that question.
- Avoid titles that merely restate task instructions such as "按要求修改", "处理用户反馈", or "继续完善功能" unless the diff itself is truly that broad and nonspecific.

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

When creating the UTF-8 message file, prefer `apply_patch` over shell redirection so the text is preserved exactly and does not pick up shell-specific encoding issues.

Do not `git add` `.git-commit-message.txt`. If it was accidentally staged, remove it from the index before committing. The file is a temporary input to `git commit -F`, not part of the business change set.

If the just-created commit message is garbled, fix it immediately by rewriting only `HEAD` with a UTF-8 message file:

```sh
git -c i18n.commitEncoding=utf-8 commit --amend -F .git-commit-message.txt
git cat-file -p HEAD
```

If the amended message still appears wrong, inspect the message file itself before trying another amend. Do not repeatedly amend based only on terminal rendering.

After the commit message is verified, delete `.git-commit-message.txt` from the working tree.

If creating the commit is impossible, output only the final commit message text so the user can use it directly.

- Write the commit message in Simplified Chinese.
- Keep proper nouns, product names, framework names, command names, file names,
  API names, technical abbreviations, and Conventional Commits type/scope text
  in their original language. For example, write `添加 commit skill` instead of
  translating `commit` or `skill`.
