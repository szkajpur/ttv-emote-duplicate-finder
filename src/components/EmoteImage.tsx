import { type Component, createSignal, onMount } from "solid-js";

interface Url {
	size: string;
	url: string;
}

interface EmoteImageProps {
	urls: Url[];
	alt: string;
}

const EmoteImage: Component<EmoteImageProps> = (props) => {
	const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 });
	const [loaded, setLoaded] = createSignal(false);

	const getBestQualityUrl = () => {
		const sortedUrls = [...props.urls].sort((a, b) => {
			const aSize = Number.parseInt(a.size);
			const bSize = Number.parseInt(b.size);
			return bSize - aSize;
		});

		return sortedUrls[0].url;
	};

	onMount(() => {
		const img = new Image();
		img.src = getBestQualityUrl();
		img.onload = () => {
			setDimensions({ width: img.width, height: img.height });
			setLoaded(true);
		};
	});

	const getImageStyles = () => {
		const dim = dimensions();
		const aspectRatio = dim.width / dim.height;

		if (aspectRatio > 1.5) {
			return {
				width: "96px",
				height: "48px",
			};
		}
		if (aspectRatio < 0.5) {
			return {
				width: "32px",
				height: "64px",
			};
		}
		return {
			width: "48px",
			height: "48px",
		};
	};

	return (
		<div class="relative group min-w-[48px] flex items-center justify-center">
			{!loaded() && (
				<div class="absolute inset-0 bg-gray-800 animate-pulse rounded" />
			)}
			<img
				src={getBestQualityUrl()}
				alt={props.alt}
				style={getImageStyles()}
				class="object-contain transform group-hover:scale-150 transition-transform duration-200"
				loading="lazy"
				decoding="async"
				onLoad={() => setLoaded(true)}
			/>
		</div>
	);
};

export default EmoteImage;
