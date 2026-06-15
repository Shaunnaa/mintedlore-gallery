# AI Story Generator Prompt

**Instructions for the User:** 
Copy the entire text below the line and paste it into ChatGPT, Claude, or any other AI assistant. Fill in the `[BRACKETS]` with your specific story idea, and the AI will generate perfectly compatible code for your Game Hub!

---

**Copy the text below:**

Act as an expert frontend developer and creative storyteller. I need you to write a single block of HTML and CSS that tells a short, engaging story using scroll-driven animations. 

This HTML will be injected directly into a web platform. You must follow these strict technical rules:

### Technical Requirements:
1. **Single File:** Provide only one block of code containing both `<style>` and HTML tags. Do not use external CSS frameworks.
2. **No Global CSS:** NEVER use global selectors like `*`, `html`, `body`, or `:root`. Prefix all your CSS classes with `.story-wrapper` so your styles don't break the main website.
3. **Cinematic Parallax Scroll (CRITICAL):** The root container MUST use continuous, cinematic parallax scrolling without Javascript. Create a tall wrapper. Inside it, you must have TWO sibling elements:
   - `<div class="parallax-bg">`: Must use `position: sticky; top: 0; height: 100vh; overflow: hidden;`. This holds the stars, planets, and background elements.
   - `<div class="story-track">`: Must NOT be sticky, but must have `margin-top: -100vh; position: relative; z-index: 10;`. Inside it, place your scrolling scenes (`<section class="scene">`).
4. **Timeline 5 Scrollytelling Layout (CRITICAL):** The user wants the text to stay in a fixed position on the screen while they scroll (like Timeline 5), NOT scroll up naturally. 
   - To do this in pure CSS, make each `<section class="scene">` exactly `height: 100vh;`.
   - Inside the scene, place a `<div class="scene-content">` and give it `position: sticky; top: 30vh;`. This will lock the text in place while the user scrolls through that 100vh section, creating the perfect Timeline 5 illusion!
5. **Timeline 5 Animations (CRITICAL):** The user specifically wants the visual effects from "Timeline 5". You must recreate these in pure CSS:
   - **Drifting Stars:** Create 3 layers of stars in the `.parallax-bg` using `radial-gradient` and animate them with infinite CSS `@keyframes` (e.g., `animation: drift 50s linear infinite`) to simulate flying through space.
   - **Floating Planet:** Add a giant glowing planet in the `.parallax-bg` with a slow, infinite floating animation (`transform: translateY`).
   - **Flying Spaceship:** To make a spaceship "fly up" as the user scrolls, place a spaceship image/element inside the `.story-track` (between sections) so it physically scrolls up the screen along with the text!
6. **Text Animations:** Use my built-in Intersection Observer. Add the class `story-anim-trigger` to text/UI elements. Define `.story-anim-trigger` with its hidden state in CSS (`opacity: 0; transform: translateY(40px);`). When it scrolls into view, my system automatically adds `.story-anim-active` (`opacity: 1; transform: translateY(0);`). Use this to fade in text beautifully.
6. **Magic Placeholders & NFT Cards (CRITICAL):** My platform automatically injects character images and names. 
   - Use `{{NFT_IMAGE_1}}` for the first character's image URL, `{{NFT_IMAGE_2}}` for the second, etc.
   - Use `{{NFT_NAME_1}}` for the first character's name, `{{NFT_NAME_2}}` for the second, etc.
   - **Rule:** Whenever the story focuses on a specific character, you MUST display their image prominently in a beautiful, full-box "NFT Card" layout alongside or behind their text block as the user scrolls to their section.
7. **Design Aesthetics:** Use beautiful, modern sci-fi aesthetics. Dark space backgrounds, glowing drop-shadows on the images, gradient text, and elegant typography.

### Story Requirements:
- **Tone:** [INSERT TONE, e.g., Epic space opera, cyberpunk mystery, etc.]
- **Theme:** [INSERT THEME, e.g., A journey from deep space to an alien village]
- **Characters:** There are [INSERT NUMBER] characters in this story. 
- **Structure:** Create a continuous journey. 
  - Phase 1: Deep space. An epic introduction.
  - Phase 2: As the story progresses, reveal each character (`{{NFT_NAME_1}}`, `{{NFT_NAME_2}}`, etc.) one by one. Each character's section must feature their image (`{{NFT_IMAGE_X}}`) in a stylish, full-size NFT card layout alongside their part of the story.
  - Phase 3: A dramatic landing/conclusion with a call-to-action button.

Please generate the complete HTML/CSS code block now.
