function init() {

    fetch('data.json').then(response => response.json()).then(

        data => {
            
            console.log(data);

            const skills = data.averages.map(d => d.skills);

            console.log(skills);

            const controls = new Controls(skills);

        }
    )

}

init();

class Controls {

    ref = document.querySelector('.skills-container');

    constructor(skills) {

        const cont = this.ref;

        skills.forEach(skill => {

            const new_btn = document.createElement('button');
            new_btn.innerText = skill;
            new_btn.classList.add('skill-button');
            new_btn.dataset.name = skill;

            cont.appendChild(new_btn);

        })

        this.monitor();

    }

    monitor() {

        this.ref.addEventListener('click', this.on_click);

    }

    on_click(e) {

        if (e.target.tagName == 'BUTTON') {

            const clicked_btn = e.target;

            clicked_btn.classList.toggle('active');

            const clicked_skill = clicked_btn.dataset.name;

            console.log(`skill clicada: ${clicked_skill}`);

        }



    }

}