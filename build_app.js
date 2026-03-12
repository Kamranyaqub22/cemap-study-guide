const fs = require('fs');
const path = require('path');

const md1File = path.join(__dirname, 'CeMAP_Complete_Study_Guide.md');
const md2File = path.join(__dirname, 'CeMAP_Supplementary_Advanced.md');

let md1 = '';
let md2 = '';

if (fs.existsSync(md1File)) md1 = fs.readFileSync(md1File, 'utf-8');
if (fs.existsSync(md2File)) md2 = fs.readFileSync(md2File, 'utf-8');

const fullMd = md1 + '\n\n' + md2;

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CeMAP Interactive Study App</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Inter:wght@400;500;600&display=swap');

    :root {
      --bg-color: #f8fafc;
      --text-color: #0f172a;
      --accent: #3b82f6;
      --sidebar-bg: #1e293b;
      --sidebar-text: #f1f5f9;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --success: #10b981;
      --error: #ef4444;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #0b1120;
        --text-color: #f1f5f9;
        --accent: #60a5fa;
        --sidebar-bg: #0f172a;
        --sidebar-text: #f8fafc;
        --card-bg: #1e293b;
        --border: #334155;
      }
    }

    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: var(--bg-color);
      color: var(--text-color);
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar Navigation */
    #sidebar {
      width: 320px;
      background: var(--sidebar-bg);
      color: var(--sidebar-text);
      overflow-y: auto;
      padding: 1.5rem;
      border-right: 1px solid var(--border);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }
    #sidebar h2 { font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-top: 0; color: #38bdf8; letter-spacing: -0.5px; }
    #sidebar ul { list-style: none; padding: 0; }
    #sidebar li { margin-bottom: 0.5rem; }
    #sidebar a {
      color: var(--sidebar-text);
      text-decoration: none;
      font-size: 0.9rem;
      opacity: 0.7;
      transition: all 0.2s ease;
      display: block;
      padding: 0.3rem 0;
    }
    #sidebar a:hover { opacity: 1; color: #38bdf8; transform: translateX(4px); }

    /* Main Content */
    #content-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      scroll-behavior: smooth;
    }
    .container { 
      max-width: 850px; 
      margin: 0 auto; 
      background: var(--card-bg); 
      padding: 3rem 4rem; 
      border-radius: 16px; 
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
    }

    /* Typography */
    h1, h2, h3 { font-family: 'Outfit', sans-serif; color: var(--accent); margin-top: 2.5rem; }
    h1 { font-size: 2.5rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
    h2 { font-size: 1.8rem; }
    h3 { font-size: 1.4rem; color: var(--text-color); opacity: 0.9; }
    p, li { line-height: 1.7; }
    
    /* Tables */
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 2rem 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); }
    th, td { padding: 1rem; border-bottom: 1px solid var(--border); text-align: left; }
    th { background: rgba(59, 130, 246, 0.1); font-weight: 600; color: var(--accent); }
    tr:last-child td { border-bottom: none; }
    
    /* Blockquotes */
    blockquote { 
      margin: 2rem 0; 
      padding: 1.5rem; 
      background: rgba(59, 130, 246, 0.05); 
      border-left: 4px solid var(--accent); 
      border-radius: 0 8px 8px 0; 
      font-style: italic; 
    }

    /* Code & Flashcards */
    pre { background: #0f172a; color: #e2e8f0; padding: 1.5rem; border-radius: 12px; overflow-x: auto; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
    code { font-family: 'Menlo', monospace; font-size: 0.9em; background: rgba(128,128,128,0.15); padding: 0.2rem 0.4rem; border-radius: 4px; }
    
    /* Interactive Flashcard Container */
    .flashcard-container { margin: 2rem 0; }
    .flashcard {
      background: var(--card-bg);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .flashcard:hover { transform: translateY(-2px); border-color: var(--accent); box-shadow: 0 8px 15px rgba(59, 130, 246, 0.1); }
    .fc-q { font-weight: 600; font-size: 1.1rem; color: var(--text-color); }
    .fc-a { margin-top: 1rem; color: var(--accent); font-weight: 500; display: none; padding-top: 1rem; border-top: 1px dashed var(--border); }
    .fc-a.visible { display: block; animation: fadeIn 0.3s ease; }

    /* Interactive Quiz Options */
    .quiz-option { 
      display: block; 
      padding: 1rem 1.5rem; 
      margin: 0.5rem 0; 
      border: 2px solid var(--border); 
      border-radius: 8px; 
      cursor: pointer; 
      transition: all 0.2s ease; 
      background: var(--card-bg);
      font-weight: 500;
      list-style: none !important;
    }
    .quiz-option:hover { background: rgba(59, 130, 246, 0.05); border-color: var(--accent); transform: translateX(5px); }
    .quiz-option.correct { background: rgba(16, 185, 129, 0.1); border-color: var(--success); color: var(--success); }
    .quiz-option.incorrect { background: rgba(239, 68, 68, 0.1); border-color: var(--error); color: var(--error); text-decoration: line-through; opacity: 0.7;}
    
    .question-block { margin: 2.5rem 0; padding: 2rem; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px solid var(--border); }
    .question-block ul { padding: 0; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

  </style>
</head>
<body>
  <div id="sidebar">
    <h2>CeMAP Study App</h2>
    <div id="nav"></div>
  </div>
  <div id="content-wrapper">
    <div class="container" id="content"></div>
  </div>

  <script>
    // Inject Markdown
    const markdown = \`__MARKDOWN_PLACEHOLDER__\`;
    
    // Parse Markdown to HTML
    document.getElementById('content').innerHTML = marked.parse(markdown);

    // 1. Build Navigation Sidebar
    const nav = document.getElementById('nav');
    const ul = document.createElement('ul');
    document.querySelectorAll('#content h1, #content h2').forEach((heading, i) => {
      // Only include headings that are not the main title
      if(heading.textContent.includes('CeMAP — Certificate') || heading.textContent.includes('SUPPLEMENTARY')) return;
      
      const id = 'heading-' + i;
      heading.id = id;
      const li = document.createElement('li');
      li.style.paddingLeft = heading.tagName === 'H2' ? '1.5rem' : '0';
      const a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = heading.textContent.replace(/───|✅/g, '').trim();
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);

    // 2. Interactive MCQ Questions
    // Find all list items that look like MCQs (A), B), C), D))
    document.querySelectorAll('#content ul').forEach(ul => {
      let isQuizList = false;
      const listItems = ul.querySelectorAll('li');
      if(listItems.length > 0 && /^[A-D]\\)/.test(listItems[0].textContent.trim())) {
          isQuizList = true;
      }
      
      if(isQuizList) {
          ul.style.padding = '0';
          ul.parentNode.classList.add('question-block');
          
          listItems.forEach(li => {
            li.classList.add('quiz-option');
            const isCorrect = li.textContent.includes('✅');
            if(isCorrect) {
                // remove the checkmark for the UX so user has to guess
                li.textContent = li.textContent.replace('✅', '').trim();
            }
            
            li.addEventListener('click', () => {
              // Reset siblings
              ul.querySelectorAll('li').forEach(sibling => {
                  sibling.classList.remove('correct', 'incorrect');
              });
              
              if (isCorrect) {
                li.classList.add('correct');
                li.innerHTML = li.textContent + ' <span style="float:right">✅ Correct</span>';
              } else {
                li.classList.add('incorrect');
                // Auto-show correct answer
                listItems.forEach(sibling => {
                   if(sibling.dataset.correct === "true") {
                       sibling.classList.add('correct');
                   }
                });
              }
            });
            
            if(isCorrect) li.dataset.correct = "true";
          });
      }
    });

    // 3. Interactive Flashcards (Convert <pre> blocks of Q/A into clickable cards)
    document.querySelectorAll('#content pre').forEach(pre => {
      const text = pre.textContent;
      if (text.includes('Q: Full form of CeMAP?') || text.includes('Q:')) {
          const lines = text.split('\\n').filter(l => l.trim().length > 0);
          const container = document.createElement('div');
          container.className = 'flashcard-container';
          
          let currentQ = '';
          let currentA = '';
          
          for(let i=0; i<lines.length; i++) {
              if(lines[i].startsWith('Q:')) {
                  if(currentQ) {
                      // create card
                      const card = createFlashcard(currentQ, currentA);
                      container.appendChild(card);
                  }
                  currentQ = lines[i].replace('Q:', '').trim();
                  currentA = '';
              } else if (lines[i].startsWith('A:')) {
                  currentA = lines[i].replace('A:', '').trim();
              } else if (currentA !== '') {
                  currentA += ' ' + lines[i]; // multiline answer
              }
          }
          // add last card
          if(currentQ) container.appendChild(createFlashcard(currentQ, currentA));
          
          pre.parentNode.replaceChild(container, pre);
      }
    });

    function createFlashcard(q, a) {
        const card = document.createElement('div');
        card.className = 'flashcard';
        card.innerHTML = \`<div class="fc-q">\${q}</div><div class="fc-a">\${a}</div>\`;
        card.addEventListener('click', () => {
            card.querySelector('.fc-a').classList.toggle('visible');
        });
        return card;
    }

  </script>
</body>
</html>`;

// Safely escape backticks and money symbols for the template string injection
const safeMd = fullMd.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
const finalHtml = htmlTemplate.replace('__MARKDOWN_PLACEHOLDER__', safeMd);

const outputPath = path.join(__dirname, 'CeMAP_Interactive_App.html');
fs.writeFileSync(outputPath, finalHtml);
console.log('✅ Generated HTML successfully at:', outputPath);
