# TODO Detox

A React Native TODO app built for iPhone, designed to be tested with [Detox](https://wix.github.io/Detox/) end-to-end tests.

## Features

- **Add** a new TODO by typing in the input field and tapping **Add** (or pressing Return)
- **Complete** a TODO by tapping the circle checkbox — it gets a strikethrough when done
- **Edit** any TODO via the **Edit** button, which opens a modal to update the text
- **Delete** any TODO by swiping left to reveal the **Delete** button, then confirming the prompt
- **Progress counter** showing how many items remain out of the total

## Requirements

| Tool                    | Version                      |
| ----------------------- | ---------------------------- |
| Node.js                 | 18 or later                  |
| npm                     | 9 or later                   |
| Ruby                    | 3.0 or later (for CocoaPods) |
| Bundler                 | 2.x (`gem install bundler`)  |
| Xcode                   | 15 or later                  |
| CocoaPods               | 1.14 or later                |
| iOS device or simulator | iOS 15 or later              |

> For a physical iPhone: connect it via USB, open Xcode once, and trust the developer certificate on the device (Settings → General → VPN & Device Management).

## Installation

```bash
# 1. Install JavaScript dependencies
npm install

# 2. Install Ruby gems (CocoaPods + helpers)
bundle install

# 3. Install iOS native dependencies
cd ios && bundle exec pod install && cd ..
```

> **Important:** always use `bundle exec pod install`, never `pod install` directly.
> The system Ruby on macOS is too old and will fail with a native extension error (`cannot load such file -- ffi_c`).
> `bundle exec` ensures the correct Ruby + CocoaPods versions from the project's `Gemfile` are used.

## Running on iPhone

### Physical device (USB)

```bash
npx react-native run-ios --device
```

If you have multiple devices connected, list them first:

```bash
xcrun xctrace list devices
```

Then target one by name:

```bash
npx react-native run-ios --device "Your iPhone Name"
```

### Simulator

```bash
# Default simulator
npx react-native run-ios

# Specific device
npx react-native run-ios --simulator "iPhone 16 Pro"
```

List available simulators:

```bash
xcrun simctl list devices available
```

### Open in Xcode

```bash
xed ios
```

Then select your device from the scheme picker and press **Run (⌘R)**.

## Project Structure

```text
todo-detox/
├── App.tsx          # Main app — all TODO CRUD logic and UI
├── index.js         # Entry point
├── ios/             # Native iOS project
│   ├── Podfile
│   └── TodoDetox.xcworkspace
└── e2e/             # Detox end-to-end tests
    ├── jest.config.js
    └── todo-detox.test.js
```

## Running Tests

The project uses [Detox](https://wix.github.io/Detox/) for end-to-end tests on the iOS simulator.

```bash
# Build the app and run all tests
npm test
```

The `pretest` script builds the release binary automatically before the tests run. To skip the build when the binary is already up to date:

```bash
npx detox test --configuration ios.sim.release
```

## Testability

All interactive elements carry `testID` props for Detox selectors:

| testID                  | Element                              |
| ----------------------- | ------------------------------------ |
| `new-todo-input`        | Text input to add a TODO             |
| `add-todo-button`       | Add button                           |
| `todo-list`             | The scrollable list                  |
| `todo-item-{id}`        | Individual list item                 |
| `todo-text-{id}`        | TODO label text                      |
| `toggle-todo-{id}`      | Checkbox to complete/uncomplete      |
| `edit-todo-{id}`        | Edit button                          |
| `swipe-delete-{id}`     | Delete button revealed on swipe left |
| `edit-modal`            | Edit modal container                 |
| `edit-todo-input`       | Text input inside edit modal         |
| `cancel-edit-button`    | Cancel button inside edit modal      |
| `save-edit-button`      | Save button inside edit modal        |
| `delete-confirm-modal`  | Delete confirmation modal container  |
| `cancel-delete-button`  | Cancel button inside delete modal    |
| `confirm-delete-button` | Confirm button inside delete modal   |
| `todo-count`            | Remaining/total counter              |
