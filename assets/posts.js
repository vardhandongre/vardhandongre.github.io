/* Index of blog posts (Notes). Newest first.
   To publish a post: copy notes/_template.html to notes/<slug>.html, write it,
   then add an entry here. Both notes/index.html and the home page read this. */
window.POSTS = [
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
