import placeholder from '../assets/turon-placeholder.png';

export default function ProductImage({ src, name }) {
  return <img key={src} src={src || placeholder} alt={src ? name : `Placeholder for ${name}`}
    className="h-full w-full bg-white object-contain brightness-[1.06] contrast-[1.08]"
    onError={({ currentTarget: image }) => {
      if (image.getAttribute('src') === placeholder) return;
      image.alt = `Placeholder for ${name}`;
      image.src = placeholder;
    }} />;
}
