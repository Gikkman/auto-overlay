# auto-overlay

A small program for automatically adding a overlay image on top of a all images in a folder (and subfolders). The program will automatically scale the overlay to fit the image we're trying to apply it to. Scaled overlays retain their dimensions, so some cropping may occur if overlay and image don't have matching proportions.

# Install
`npm install` - Will install all dependenceies

# Run
`npm run compile` - Will transpile the Typescript code to Javascript

`npm run start` - Will run the Javascript code

# Build
`npm run build` - Will build a Windows executable

# Example
Clone the repo and run the install and run commands, or download the latest release zip, extract it and run the executable to see the program in action. It'll take all images in the `test_input` directory and apply the `overlay.png` on top of them. The results are outputted into a folder named `test_output`, retaining the folder and file structure of the input. Note how the overlay is scaled to fit the different input images.
