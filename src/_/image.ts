export function rotateImage (imageUrl: string, spin: number) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ([canvas.width, canvas.height] = spin % 2 ? [img.height, img.width] : [img.width, img.height]);

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((Math.PI * spin) / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}
