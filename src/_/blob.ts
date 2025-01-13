export function blobToUrl (blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string); // Résoudre avec la Data URL
    reader.onerror = reject; // Rejeter en cas d'erreur
    reader.readAsDataURL(blob); // Lire le Blob comme Data URL
  });
}
