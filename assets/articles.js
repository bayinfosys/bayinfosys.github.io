document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("techTalkAccordion");
  const template = document.getElementById("article-card-template").innerHTML;
  const res = await fetch("/assets/articles.json");
  const data = await res.json();

  data.forEach((group, index) => {
    const safeId = group.topic.toLowerCase().replace(/[^a-z0-9]/g, "");
    const headingId = `heading${safeId}`;
    const collapseId = `collapse${safeId}`;

    const cardsHTML = group.articles.map(article => {
      return template
        .replace("{{title}}", article.title)
        .replace("{{description}}", article.description)
        .replace("{{keywords}}", article.keywords.join(", "))
        .replace("{{link}}", article.link);
    }).join("");

    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    accordionItem.innerHTML = `
      <h2 class="accordion-header" id="${headingId}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
          ${group.topic}
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#techTalkAccordion">
        <div class="accordion-body">
          <div class="row">
            ${cardsHTML}
          </div>
        </div>
      </div>
    `;
    container.appendChild(accordionItem);
  });
});
