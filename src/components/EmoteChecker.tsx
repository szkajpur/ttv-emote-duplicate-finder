import autoAnimate from "@formkit/auto-animate";
import { For, Show, createResource, createSignal, onMount } from "solid-js";
import type { Component } from "solid-js";
import EmoteImage from "./EmoteImage";

interface Url {
	size: string;
	url: string;
}

interface Emote {
	animated: boolean;
	code: string;
	provider: number;
	urls: Url[];
	zero_width: boolean;
}

interface EmoteGroup {
	[key: string]: Emote[];
}

const getProviderName = (provider: number): string => {
	switch (provider) {
		case 0:
			return "Twitch";
		case 1:
			return "7TV";
		case 2:
			return "BTTV";
		case 3:
			return "FFZ";
		default:
			return "Unknown";
	}
};

const getProviderColor = (provider: number): string => {
	switch (provider) {
		case 0:
			return "bg-purple-500/20 text-purple-300";
		case 1:
			return "bg-blue-500/20 text-blue-300";
		case 2:
			return "bg-red-500/20 text-red-300";
		case 3:
			return "bg-green-500/20 text-green-300";
		default:
			return "bg-gray-500/20 text-gray-300";
	}
};

const EmoteChecker: Component = () => {
	const [channel, setChannel] = createSignal("");
	const [caseSensitive, setCaseSensitive] = createSignal(true);
	const [emotes, { mutate }] = createResource(channel, async (channel) => {
		if (!channel) return null;

		try {
			const response = await fetch(
				`https://emotes.crippled.dev/v1/channel/${channel}/all`,
			);
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error(`Channel "${channel}" not found`);
				}
				throw new Error(`Failed to fetch emotes (HTTP ${response.status})`);
			}
			return await response.json();
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unexpected error occurred");
			}
			mutate(null);
			return null;
		}
	});

	const [error, setError] = createSignal("");
	let resultsRef: HTMLDivElement | undefined;

	onMount(() => {
		if (resultsRef) {
			autoAnimate(resultsRef);
		}
	});

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const input = form.elements.namedItem("channel") as HTMLInputElement;
		setError("");
		setChannel(input.value.trim());
	};

	const duplicates = () => {
		if (!emotes()) return {};
		return findDuplicates(emotes() as Emote[]);
	};

	const findDuplicates = (emotes: Emote[]): EmoteGroup => {
		const duplicates: EmoteGroup = {};
		const codeMap: { [key: string]: string } = {};

		for (const emote of emotes) {
			const code = caseSensitive() ? emote.code : emote.code.toLowerCase();
			if (!codeMap[code]) {
				codeMap[code] = emote.code;
			}
		}

		for (const emote of emotes) {
			const code = caseSensitive() ? emote.code : emote.code.toLowerCase();
			const originalCode = codeMap[code];

			if (!duplicates[originalCode]) {
				duplicates[originalCode] = [];
			}
			duplicates[originalCode].push(emote);
		}

		for (const key of Object.keys(duplicates)) {
			if (duplicates[key].length === 1) {
				delete duplicates[key];
			}
		}

		return duplicates;
	};

	const EmoteInfo: Component<{
		emoteName: string;
		emotes: Emote[];
		caseSensitive: boolean;
	}> = (props) => {
		const uniqueNames = [...new Set(props.emotes.map((e) => e.code))];
		const hasMultipleNames = uniqueNames.length > 1;

		return (
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2 antialiased">
					<span class="font-medium">{props.emoteName}</span>
					<span class="px-2 py-1 text-sm bg-yellow-500/20 text-yellow-300 rounded-full">
						{props.emotes.length} duplicates
					</span>
				</div>
				{hasMultipleNames && !props.caseSensitive && (
					<div class="text-sm text-gray-400 antialiased">
						Variations: {uniqueNames.join(", ")}
					</div>
				)}
			</div>
		);
	};

	const DuplicateStats: Component<{ duplicates: EmoteGroup }> = (props) => {
		let totalDuplicates = 0;
		for (const emotes of Object.values(props.duplicates)) {
			totalDuplicates += emotes.length;
		}
		const uniqueEmoteNames = Object.keys(props.duplicates).length;

		return (
			<div class="mb-6 p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
				<div class="grid grid-cols-2 gap-4">
					<div class="text-center p-3 bg-gray-900/50 rounded-lg">
						<div class="text-2xl font-bold text-purple-400 antialiased">
							{uniqueEmoteNames}
						</div>
						<div class="text-sm text-gray-400 antialiased">
							Unique emote names with duplicates
						</div>
					</div>
					<div class="text-center p-3 bg-gray-900/50 rounded-lg">
						<div class="text-2xl font-bold text-blue-400 antialiased">
							{totalDuplicates}
						</div>
						<div class="text-sm text-gray-400 antialiased">
							Total duplicate emotes
						</div>
					</div>
				</div>
			</div>
		);
	};

	const Footer: Component = () => {
		return (
			<footer class="mt-12 py-6 border-t border-gray-800">
				<div class="text-center text-gray-400 antialiased">
					<p class="mb-2">
						Created by{" "}
						<a
							href="https://github.com/szkajpur"
							target="_blank"
							rel="noopener noreferrer"
							class="text-purple-400 hover:text-purple-300 transition-colors"
						>
							szkajpur
						</a>
					</p>
					<a
						href="https://github.com/szkajpur/ttv-emote-duplicate-finder"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 24 24"
							fill="currentColor"
							role="img"
							aria-labelledby="githubIconTitle"
						>
							<title id="githubIconTitle">GitHub repository</title>
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
						</svg>
						<span>View on GitHub</span>
					</a>
				</div>
			</footer>
		);
	};

	return (
		<div class="max-w-4xl mx-auto">
			<form
				onSubmit={handleSubmit}
				class="mb-8 flex flex-col items-center gap-4"
			>
				<div class="w-full max-w-md relative group">
					<input
						type="text"
						name="channel"
						placeholder="Enter channel name..."
						class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg 
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   transition-all duration-300 outline-none antialiased
                   placeholder-gray-500"
						required
						disabled={emotes.loading}
					/>
					<div
						class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 
                      group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
					/>
				</div>

				<div class="flex items-center gap-2 text-gray-300 antialiased">
					<label class="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							class="sr-only peer"
							checked={caseSensitive()}
							onChange={(e) => setCaseSensitive(e.currentTarget.checked)}
						/>
						<div
							class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 
            peer-focus:ring-purple-500 rounded-full peer 
            peer-checked:after:translate-x-full 
            peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
            after:bg-white after:rounded-full after:h-5 after:w-5 
            after:transition-all"
						/>
					</label>
					<span class="text-sm antialiased">
						{caseSensitive()
							? "Case-sensitive matching (kappa ≠ Kappa)"
							: "Case-insensitive matching (kappa = Kappa)"}
					</span>
				</div>

				<button
					type="submit"
					disabled={emotes.loading}
					class="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg
               transition-all duration-300 transform antialiased
               ${emotes.loading ? 
                 'opacity-75 cursor-not-allowed' : 
                 'hover:from-purple-500 hover:to-blue-500 hover:scale-105 active:scale-95'
               }"
				>
					{emotes.loading ? "Loading emotes..." : "Check Emotes"}
				</button>
			</form>

			<Show when={error()}>
				<div class="mb-8 mx-auto max-w-md">
					<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
						<div class="flex items-center justify-center gap-2 text-red-400 mb-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
								role="img"
								aria-labelledby="errorIconTitle"
							>
								<title id="errorIconTitle">Error icon</title>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>

							<span class="antialiased font-medium">Error</span>
						</div>
						<p class="antialiased text-red-300">{error()}</p>
					</div>
				</div>
			</Show>

			<Show
				when={
					!emotes.loading &&
					!error() &&
					channel() &&
					Object.keys(duplicates()).length > 0
				}
			>
				<DuplicateStats duplicates={duplicates()} />
			</Show>

			<Show
				when={
					!emotes.loading &&
					!error() &&
					channel() &&
					Object.keys(duplicates()).length === 0
				}
			>
				<div class="text-center text-gray-400 animate-fade-in mb-8">
					No duplicate emotes found
				</div>
			</Show>

			<div class="space-y-6" ref={resultsRef}>
				<For each={Object.entries(duplicates())}>
					{([emoteName, dupeEmotes]) => (
						<div
							class="border border-gray-800 rounded-lg p-4 bg-gray-900/50 backdrop-blur-sm
                transform hover:scale-[1.02] transition-all duration-300"
						>
							<h3 class="text-lg font-semibold mb-2">
								<EmoteInfo
									emoteName={emoteName}
									emotes={dupeEmotes}
									caseSensitive={caseSensitive()}
								/>
							</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<For each={dupeEmotes}>
									{(emote) => (
										<div
											class="border border-gray-800 rounded-lg p-4 flex items-center gap-3
                                bg-gray-800/30 hover:bg-gray-900/50 transition-all duration-300"
										>
											<EmoteImage urls={emote.urls} alt={emote.code} />
											<div class="flex-1 min-w-0">
												<span
													class={`antialiased inline-block px-2 py-1 text-sm rounded-full mb-1 
                                    ${getProviderColor(emote.provider)}`}
												>
													{getProviderName(emote.provider)}
												</span>
												<p class="antialiased text-sm text-gray-400">
													{emote.animated ? "Animated" : "Static"}
												</p>
											</div>
										</div>
									)}
								</For>
							</div>
						</div>
					)}
				</For>
			</div>
			<Footer />
		</div>
	);
};

export default EmoteChecker;
