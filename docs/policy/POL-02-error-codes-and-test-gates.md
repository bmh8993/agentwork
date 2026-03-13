# Error Codes and Test Gates (MVP)

- Date: 2026-03-13
- Status: Draft for implementation

## 1) Error Code Catalog

| error_code | category | trigger_stage | message_user | next_action | retryable |
|---|---|---|---|---|---|
| `missing_version` | `ValidationError` | `Load` / `Draft` / `Publish` / `Run` | Version is missing. | Add `version: "1"` to `SKILL.json`. | `false` |
| `invalid_version_type` | `ValidationError` | `Load` / `Draft` / `Publish` / `Run` | Version format is invalid. | Set `version` to a string value. | `false` |
| `unsupported_version` | `ValidationError` | `Load` / `Publish` / `Run` | This version is not supported. | Migrate to a supported version. | `false` |
| `schema_validation_failed` | `ValidationError` | `Draft` / `Publish` / `Run` | File structure is invalid. | Fix required fields and field types. | `false` |
| `migration_failed` | `ValidationError` | `Load` | Migration failed. | Restore from `.bak` and retry migration. | `true` |
| `unsupported_node_type` | `ValidationError` | `Publish` / `Run` | Unsupported node type is included. | Replace unsupported nodes with supported types. | `false` |
| `publish_required_field_missing` | `ValidationError` | `Publish` | Required publish fields are missing. | Fill `action_text` and `done_criteria`. | `false` |
| `publish_validation_failed` | `ValidationError` | `Publish` | Publish validation failed. | Resolve validation errors and publish again. | `false` |
| `run_validation_failed` | `ValidationError` | `Run` | Pre-run validation failed. | Resolve validation errors and run again. | `false` |
| `missing_required_file` | `InstallError` | `Install` | Required file is missing. | Include `SKILL.json` as canonical input (`SKILL.md` only is not install input). | `false` |
| `invalid_package_layout` | `InstallError` | `Install` | Package layout is invalid. | Fix package layout to match the spec. | `false` |
| `unsupported_source` | `InstallError` | `Install` | Unsupported install source. | Use local folder or npm source only. | `false` |
| `skill_compile_failed` | `InstallError` | `Install` | `SKILL.md` compilation failed. | Fix skill content and retry install. | `false` |
| `dependency_resolution_failed` | `InstallError` | `Install` | Dependency resolution failed. | Check package versions and network, then retry. | `true` |
| `request_timeout` | `RuntimeError` | any | Request timed out. | Retry after a short delay. | `true` |

## 2) Test Gates

| gate_name | level | command_example | fail_condition | blocks_merge |
|---|---|---|---|---|
| `schema-contract` | `required` | `pnpm test:contract:schema` | Any v1 schema fixture fails. | `true` |
| `load-compat-readonly` | `required` | `pnpm test:contract:load` | Unsupported-node document cannot open in read-only compatibility mode, or source is mutated. | `true` |
| `draft-structural-save` | `required` | `pnpm test:contract:draft` | Draft save skips structural integrity checks. | `true` |
| `publish-gate-required-fields` | `required` | `pnpm test:contract:publish` | Publish passes when `action_text` or `done_criteria` is missing. | `true` |
| `run-gate-strict` | `required` | `pnpm test:contract:run` | Run starts when strict validation fails. | `true` |
| `install-folder-only` | `required` | `pnpm test:installer` | Zip install input is accepted. | `true` |
| `installer-npm-errors` | `recommended` | `pnpm test:installer:npm` | npm install error-to-code mapping is inconsistent. | `false` |
| `chat-stream-delta-merge` | `recommended` | `pnpm test:session-stream` | `message.part.updated` text delta merge fails. | `false` |
| `ui-error-next-action` | `recommended` | `pnpm test:ui-errors` | Error card misses `next_action`. | `false` |

## 3) Alignment

This document aligns with:

1. `ADR-0005` (error contract and UX)
2. `ADR-0008` (validation/migration stages)
3. `ADR-0009` (acceptance tests and CI gates)
4. `ADR-0010` (install error codes)
5. `ADR-0015` and `ADR-0017` (publish/run gating and required fields)
