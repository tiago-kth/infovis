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

    constructor(skills) {

        const cont = document.querySelector('.skills-container');

        skills.forEach(skill => {

            const new_btn = document.createElement('button');
            new_btn.innerText = skill;
            new_btn.classList.add('skill-button');

            cont.appendChild(new_btn);

        })

    }

}