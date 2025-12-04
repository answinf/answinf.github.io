document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        decodeAndProcessCode();
        formatCode();
        highlightCode();
        setupCopyButtons();
    }, 100);
    
    function decodeAndProcessCode() {
        document.querySelectorAll('code.language-html').forEach(code => {
            let rawCode = '';
            
            if (code.dataset.code) {
                rawCode = code.dataset.code;
            } else {
                const content = code.innerHTML;
                rawCode = content
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#039;/g, "'");
            }
            
            const escaped = rawCode
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            code.dataset.original = rawCode.trim();
            code.innerHTML = escaped;
        });
    }
    
    function formatCode() {
        document.querySelectorAll('code').forEach(code => {
            let text = code.textContent;
            let lines = text.split('\n');

            while (lines[0] && lines[0].trim() === '') lines.shift();
            while (lines[lines.length - 1] && lines[lines.length - 1].trim() === '') lines.pop();

            let minIndent = Infinity;
            lines.forEach(line => {
                if (line.trim()) {
                    const indent = line.match(/^ */)[0].length;
                    minIndent = Math.min(minIndent, indent);
                }
            });

            if (minIndent !== Infinity && minIndent > 0) {
                lines = lines.map(line => line.substring(minIndent));
            }

            code.textContent = lines.join('\n');
        });
    }
    
    function highlightCode() {
        document.querySelectorAll('code').forEach(code => {
            let html = code.innerHTML;

            html = html.replace(/&lt;!DOCTYPE\s+([^&]*)&gt;/gi, 
                '<span class="doctype">&lt;!DOCTYPE $1&gt;</span>');

            html = html.replace(/&lt;!--([\s\S]*?)--&gt;/g, 
                '<span class="comment">&lt;!--$1--&gt;</span>');
            
            html = html.replace(/&lt;(\/?)([\w\-:]+)(\s[^&]*?)?(&gt;)/g, 
                function(match, slash, tagName, attributes, closing) {
                    let result = '&lt;' + slash + '<span class="tag">' + tagName + '</span>';
                    
                    if (attributes) {
                        result += attributes.replace(/([\w\-:]+)\s*=\s*("|'|)([^"'\s>]*)\2/g, 
                            '<span class="attr">$1</span>=$2<span class="val">$3</span>$2');
                    }
                    
                    return result + closing;
                });
         
            html = html.replace(/&gt;([^<]+)&lt;/g, 
                '&gt;<span class="text">$1</span>&lt;');
        
            code.innerHTML = html;
        });
    }
    
    function setupCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            const codeBlock = btn.parentElement.querySelector('code');
            const originalCode = codeBlock.dataset.original || codeBlock.textContent;
            
            btn.dataset.originalCode = originalCode;
            
            btn.addEventListener('click', function() {
                const codeText = this.dataset.originalCode;
                
                navigator.clipboard.writeText(codeText)
                    .then(() => {
                        this.textContent = 'Скопировано!';
                        this.classList.add('copied');
                        
                        setTimeout(() => {
                            this.textContent = 'Копировать';
                            this.classList.remove('copied');
                        }, 1500);
                    })
                    .catch(err => {
                        const textarea = document.createElement('textarea');
                        textarea.value = codeText;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        
                        this.textContent = 'Скопировано!';
                        setTimeout(() => this.textContent = 'Копировать', 1500);
                    });
            });
        });
    }
});