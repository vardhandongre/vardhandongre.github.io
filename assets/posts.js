/* Index of blog posts (Notes). Newest first.
   To publish a post: copy notes/_template.html to notes/<slug>.html, write it,
   then add an entry here. Both notes/index.html and the home page read this. */
window.POSTS = [
  {
    slug: "embodied-conversational-agents",
    title: "Embodied Conversational Agents and the Promise of Foundation Models",
    date: "2026-04-12",
    summary: "Where conversational agents meet the physical world, and what foundation models actually buy us.",
    tags: ["Agents", "Multimodal", "Position"],
    minutes: 14
  },
  {
    slug: "why-context-engineering-is-the-real-bottleneck",
    title: "Why Context Engineering — Not Scale — Is the Real Bottleneck",
    date: "2026-02-03",
    summary: "A short position piece: the most expensive choice in deployed AI is what the model gets to see.",
    tags: ["Alignment", "Position"],
    minutes: 7
  }
];

window.formatPostDate = function(iso){
  var d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
