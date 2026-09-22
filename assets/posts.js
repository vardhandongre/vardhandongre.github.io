/* Index of blog posts (Notes). Newest first.
   To publish a post: copy notes/_template.html to notes/<slug>.html, write it,
   then add an entry here. Both notes/index.html and the home page read this. */
window.POSTS = [
  {
    slug: "understanding-rl-visualization",
    title: "Understanding Visualizations in Reinforcement Learning",
    date: "2026-09-21",
    summary: "A field guide to the handful of plot types that carry almost every result in RL for language and vision-language models: what each is for, how to read it, which clock its x-axis runs on, and where it misleads.",
    tags: ["Reinforcement Learning", "LLMs", "Visualization"],
    minutes: 56
  },
  {
    slug: "embodied-conversational-agents",
    title: "Embodied Conversational Agents and the Promise of Foundation Models",
    date: "2025-03-08",
    summary: "Why language in embodied AI should be a cognitive scaffold rather than a command channel — and where the datasets, simulators, and models stand today.",
    tags: ["Embodied AI", "Agents", "Survey"],
    minutes: 12
  }
];

window.formatPostDate = function(iso){
  var d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
