export const shareWA = (text: string): void => {
  const encoded = encodeURIComponent(text);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = `whatsapp://send?text=${encoded}`;
  } else {
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }
};

export const buildShare = (emoji: string, lines: string[]): string =>
  `${emoji} Mario Calculator\n\n${lines.filter(Boolean).join('\n')}\n\n🍄 Powered by Mario Calculator\nby Saiful Islam (Sumir)`;
