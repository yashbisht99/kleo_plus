
/**
 * LinkedIn doesn't support rich text (Markdown) but supports mathematical Unicode characters.
 * These functions map standard A-Z, a-z to these special characters.
 */

const charMaps: Record<string, string> = {
  bold: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
  italic: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻",
  normal: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
};

export const applyStyle = (text: string, style: 'bold' | 'italic'): string => {
  const map = charMaps[style];
  const normal = charMaps.normal;
  
  return text.split('').map(char => {
    const index = normal.indexOf(char);
    if (index !== -1) {
      // Bold characters are encoded as 2-character UTF-16 surrogates
      // Each bold/italic character in our map is technically two JS string indices
      return map.slice(index * 2, (index * 2) + 2);
    }
    return char;
  }).join('');
};
