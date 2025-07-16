export function convertCamelToTitle(str) {
    // Replace any dots with spaces.
    const noDots = str.replace(/\./g, ' ');
    // Insert spaces before uppercase letters (for camel case).
    const withSpaces = noDots.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Split the string into words.
    const words = withSpaces.split(' ');
    // Capitalize the first letter of each word.
    const titleCasedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    );
    // Rejoin the words with a space in between.
    return titleCasedWords.join(' ');
}