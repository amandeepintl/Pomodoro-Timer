# ⏳ Aesthetic Pomodoro Timer

A professional, high-performance Pomodoro application designed for deep work and effective time management. This project combines minimalist aesthetics with robust functionality, featuring glassmorphism UI, dynamic themes, and a responsive timer engine.
# 📸 Screenshots
![Calculator Preview](screenshot.png)
## ✨ Features

* **Adaptive UI Themes**: The entire background ambiance shifts colors based on the current mode (Work, Short Break, or Long Break).
* **Precision Controls**: Set custom durations for work and break sessions using a refined "Hours:Minutes" stepper system.
* **Visual Progress**: A circular SVG progress ring that depletes in real-time, providing immediate visual feedback.
* **Auto-Break System**: Optional "Auto-Switch" toggle to automatically transition between work and break sessions.
* **State Persistence**: Uses `localStorage` to remember your custom settings, session counts, and current progress if the page is refreshed.
* **Interactive Feedback**: Includes clean audio alerts for completion and tactile click sound effects for UI interactions.

## 🛠️ Built With

* **HTML5 & CSS3**: Utilizes custom properties (variables), Flexbox/Grid, and advanced CSS animations for the "pulsing orb" background.
* **Vanilla JavaScript**: ES6+ logic for the timer engine, modal state management, and DOM manipulation.
* **AI Collaboration**: I utilized AI to optimize the timer logic, refine the glassmorphism styling, and ensure the code follows modern clean-coding standards.
* **Google Fonts**: 'Outfit' for a modern, geometric feel.

## 🚀 Quick Start

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/amandeepintl/Pomodoro-Timer.git](https://github.com/amandeepintl/Pomodoro-Timer.git)
    ```
2.  **Open the app**: Open `index.html` in any modern web browser.
3.  **Customize**: Use the **Settings** icon in the top right to adjust your intervals.

## 🧠 Logic Highlights

The application manages time using a centralized state system that handles:
1.  **Interval Management**: Precision countdowns that update the document title so you can monitor time from the browser tab.
2.  **Dynamic Theming**: Injecting specific CSS classes into the `<body>` to trigger smooth theme transitions.
3.  **Mode Switching**: A robust `switchMode` function that saves progress before transitioning to the next session.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
**Developed for the MEXT Scholarship portfolio.** If this helped you stay productive, feel free to give it a ⭐!
