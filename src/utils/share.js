// Opens WhatsApp directly using deep link — works on mobile app & web
export const shareWA = (text) => {
  const encoded = encodeURIComponent(text);
  // Try native app first via deep link, fallback to web
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = `whatsapp://send?text=${encoded}`;
  } else {
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }
};

export const buildShare = (emoji, lines) =>
  `${emoji} Mario Calculator\n\n${lines.filter(Boolean).join('\n')}\n\n🍄 Powered by Mario Calculator\nby Saiful Islam (Sumir)`;
