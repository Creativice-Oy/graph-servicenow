# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Made `user`, `group` and `incident` keys more detailed by including the
  `name`/`email` property.

### Updated

- Updated SDK dependencies to 8.29.2.
- Changed ENV `USERNAME` property name to `USERID`.

## v0.3.0 - 2022-07-12

### Updated

- Updated SDK dependencies to 8.19.0.

## v0.2.0 - 2021-02-11

### Updated

- Updated SDK dependencies to 5.6.2.

### Fixed

- Change Polly config to not match recordings by hostname or headers.

### Added

- Added `service_now_incident` entities and relationships.

## v1.1.0 - 2020-09-25

- Initial release
- Added `service_now_account`, `service_now_user`, and `service_now_group`
  entities
