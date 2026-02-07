# No Grok

**Block "Hey Grok" posts and reclaim your X (Twitter) timeline.**

![Version](https://img.shields.io/badge/version-1.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**No Grok** is a lightweight, high-performance Chrome Extension designed to filter unwanted content from your X (formerly Twitter) experience, specifically targeting "Hey Grok" interactions and other spam patterns.

## Features

- **Advanced Filtering**: Automatically hides posts containing "Hey Grok", "@grok", and various permutations.
- **Custom Keywords**: Define your own keywords or phrases to block specific content.
- **Real-time Blocking**: Scans the timeline during scrolling and removes unwanted content instantly.
- **Block Counter**: Tracks the number of blocked posts.
- **Sync Enabled**: Settings and custom keywords sync across Chrome devices.
- **Performance Focused**: Utilizes efficient DOM observation to ensure smooth browsing.

## Installation

### From Source (Developer Mode)

1.  **Clone or Download** this repository:
    ```bash
    git clone https://github.com/mugenkyou/nogrok.git
    ```
2.  Open **Chrome** and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top-right corner.
4.  Click **Load unpacked**.
5.  Select the `nogrok` folder.
6.  The extension is now active.

## Usage

1.  **Click the Extension Icon** in the toolbar to open the popup.
2.  **Toggle Blocking**: Enable or disable the blocker.
3.  **Manage Keywords**: 
    - Click "Manage Keywords" to view the list.
    - Enter a new word and press Enter or click "Add".
    - Click the remove icon on a tag to delete it.
    - Keywords are saved automatically.
4.  **Reset Counter**: Clear the blocked post statistics.

## Contributing

Contributions are welcome. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
