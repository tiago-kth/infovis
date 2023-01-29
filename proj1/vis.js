function init() {

    fetch('data.json')
      .then(response => response.json())
      .then(

        data => {
            
            console.log(data);

            const skills = data.averages.map(d => d.skills);

            console.log(skills);

            const chart = new Chart(data, skills);
            const tt = new Tooltip(chart, data.averages, data.main_data, skills);
            const bubbles = new Bubbles(chart, tt, data.main_data);
            const controls = new Controls(skills, bubbles);
            

            console.log(chart, chart.x_hist.range(), chart.y_hist.range());

            /*
            const bubbles = data.main_data.map((datum, i) => {
                return new Bubble(datum, i, chart);
            });
            */

            // const bubbles = d3.select('.vis').selectAll('circle').data(data.main_data).join('circle')
            //   .classed('data-point', true)
            //   .attr('data-id', (d,i) => i)
            //   .attr('cx', 0)
            //   .attr('cy', 0)
            // ;



            console.log(bubbles);


        }
    )

}

init();

class Controls {

    ref = document.querySelector('.skills-container');
    ref_radio = document.querySelector('.control-type');

    selection_type = 'one';
    skills_selected = [];

    first_click = false;

    bubbles;

    chart;

    constructor(skills, bubbles) {

        const cont = this.ref;
        this.bubbles = bubbles;
        this.chart = bubbles.chart_ref;

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

        this.ref.addEventListener('click', e => this.update_chart(e, this));
        this.ref_radio.addEventListener('change', e => this.radio_change(e, this));

    }

    update_chart(e, controls) {

        if (!controls.first_click) {
            controls.chart.show_axis_labels_histogram();
            controls.bubbles.ref.classed('initial', false);
            controls.first_click = true;
        }

        console.log(controls.selection_type);

        const selection_type = controls.selection_type;
        const bubbles = controls.bubbles;

        if (e.target.tagName == 'BUTTON') {

            const clicked_btn = e.target;

            const clicked_skill = clicked_btn.dataset.name;

            console.log(`skill clicada: ${clicked_skill}`);

            if (selection_type == 'one') {

                console.log('here');

                controls.clear_buttons();

                clicked_btn.classList.toggle('active');

                controls.skills_selected = [] 
                controls.skills_selected[0] = clicked_skill;

            }

            if (selection_type == 'two') {

                if (!controls.skills_selected.includes(clicked_skill)) {

                    controls.skills_selected.push(clicked_skill);

                }

                controls.skills_selected.splice(0, controls.skills_selected.length-2);
                
                controls.clear_buttons();
                controls.match_buttons_to_skill_selection();

            }

            if (selection_type == 'any') {

                if (!controls.skills_selected.includes(clicked_skill)) {

                    controls.skills_selected.push(clicked_skill);

                } else {

                    const index = controls.skills_selected.indexOf(clicked_skill);
                    console.log(index, clicked_skill);

                    controls.skills_selected.splice(index, 1);

                }

                controls.clear_buttons();
                controls.match_buttons_to_skill_selection();

            }

            console.log(controls.skills_selected);

            bubbles.move_bubbles(controls.skills_selected);

        }



    }

    radio_change(e, controls) {

        controls.selection_type = e.target.value;
        console.log(e.target.value, controls.selection_type);

    }

    clear_buttons() {

        // que interessante, aqui ele usa a referência certa ao "this"!
        //console.log(this.ref);

        Array.from(this.ref.children).forEach(skill_btn => skill_btn.classList.remove('active'));

    }

    match_buttons_to_skill_selection() {

        console.log('ok, me chamaram', this.skills_selected);

        this.skills_selected.forEach(skill => {
            
            const btn_skill = document.querySelector(`[data-name="${skill}"]`);
            btn_skill.classList.add('active');
            
        });

    }

}

class Bubbles {

    ref;
    chart_ref;
    tt;

    constructor(chart, tt, data) {

        this.ref = d3.select('.vis').selectAll('path.data-point').data(data).join('path')
              .classed('data-point', true)
              .classed('animate', true)
              .classed('initial', true)
              .attr('data-id', (d,i) => i)
              .attr('data-alias', d => d.alias)
              .attr('d', this.generate_path_circle(chart.r))
              .on('click', e => tt.show_tooltip(e, tt))
            ;

        this.chart_ref = chart;
        this.tt = tt;

    }

    generate_path_circle(r) {

        return `M-${r},0A${r},${r},0,1,1,${r},0A${r},${r},0,1,1,-${r},0Z`

    }

    generate_path_line(skills, data_point) {

        let d = '';
        const gap = this.chart_ref.gap;

        const skills_copy = [...skills]; // makes a copy to avoid messing up the original array order with the reverse method below

        skills_copy.forEach( (skill, i) => {

            const x = this.chart_ref.x_pc(skill).toPrecision(4);
            const y = (this.chart_ref.y(data_point[skill]) - gap).toPrecision(4);

            const command = i == 0 ? 'M' : 'L';

            d += `${command}${x},${y} `;

        })

        skills_copy.reverse().forEach( skill => {

            const x = this.chart_ref.x_pc(skill).toPrecision(4);
            const y = (this.chart_ref.y(data_point[skill]) + gap).toPrecision(4);

            d += `L${x},${y} `;

        })

        d += 'Z' // to close the path;

        return d;

    }

    move_bubbles(skills) {

        if (skills.length == 1) {

            if (this.chart_ref.chart_mode == 'none') {

                this.chart_ref.show_axis( this.chart_ref.y_axis);
                this.chart_ref.show_axis( this.chart_ref.x_axis);

                this.chart_ref.chart_mode = 'histogram';

            }

            if (this.chart_ref.chart_mode == 'scatter') {

                this.chart_ref.chart_mode = 'histogram';
                this.chart_ref.update_axis();

            }

            if (this.chart_ref.chart_mode == 'parallels coordinates' ) {

                this.chart_ref.chart_mode = 'histogram';
                this.chart_ref.update_axis();
                this.chart_ref.hide_all_parallel_axis();

                const d = this.generate_path_circle(this.chart_ref.r)

                this.ref
                  .transition()
                  .duration(500)
                  .attrTween('d', data_point => {
                    
                    const current_path = d3.select(`[data-alias="${data_point.alias}"]`).node().getAttribute('d');
                    const next_path = d;

                    return flubber.interpolate(
                        current_path,
                        next_path
                    )
                   })
                ;

            }

            const skill = skills[0];

            this.ref
            .classed('animate', true)
            .attr('transform', d => `translate(
                ${this.chart_ref.x_hist(d[skill])},
                ${this.chart_ref.y_hist(d['rank_' + skill])})`
            )

        }

        if (skills.length == 2) {

            if (this.chart_ref.chart_mode == 'parallels coordinates' ) {

                this.chart_ref.chart_mode = 'scatter';
                this.chart_ref.update_axis();
                this.chart_ref.hide_all_parallel_axis();

                const d = this.generate_path_circle(this.chart_ref.r)

                this.ref
                  .transition()
                  .duration(500)
                  .attr('transform', d => `translate( 
                    ${this.chart_ref.x_scatter(d[skills[0]])},
                    ${this.chart_ref.y(d[skills[1]])})`
                   ) // this is repeated here to make the transition smoother.
                  .attrTween('d', data_point => {
                    
                    const current_path = d3.select(`[data-alias="${data_point.alias}"]`).node().getAttribute('d');
                    const next_path = d;

                    return flubber.interpolate(
                        current_path,
                        next_path
                    )
                   })
                ;

            }

            else {

                if (this.chart_ref.chart_mode == 'histogram') {

                    this.chart_ref.chart_mode = 'scatter';
                    this.chart_ref.update_axis();
    
                }

                this.ref
                    .classed('animate', true)
                    .attr('transform', d => `translate(
                        ${this.chart_ref.x_scatter(d[skills[0]])},
                        ${this.chart_ref.y(d[skills[1]])})`
                    )
                ;

            }

            this.chart_ref.show_axis_labels_scatterplot(skills);

        }

        if (skills.length > 2) {

            this.chart_ref.chart_mode = 'parallels coordinates' ;

            this.chart_ref.update_scale_pc(skills);
            this.chart_ref.update_axis();
            this.chart_ref.update_parallel_axis(skills);

            this.ref
              .classed('animate', false)            
              .transition()
              .duration(500)
              .attr('transform', 'translate(0,0)') // out of the transition chain, because it uses css animation
              .attrTween('d', data_point => {

                const current_path = d3.select(`[data-alias="${data_point.alias}"]`).node().getAttribute('d');
                const next_path = this.generate_path_line(skills, data_point);

                return flubber.interpolate(
                    current_path,
                    next_path
                )

              })
            ;

            this.chart_ref.show_axis_labels_pc();


        }
        
    }

}

class Tooltip {

    ref = document.querySelector('.vis-tooltip');
    click_capture = document.querySelector('.click-captur');

    chart;
    avg_data = {};
    summary_alias_skills = {};

    constructor(chart, avg_data, main_data, skills_list) {

        this.chart = chart;

        avg_data.forEach(average => {

            this.avg_data[average.skills] = average.avg;

        });

        main_data.forEach(person => {

            const above_avg_skills = [];
            const below_avg_skills = [];

            skills_list.forEach(skill => {

                if ( person[skill] >= this.avg_data[skill] ) {
                    above_avg_skills.push(skill);
                } else {
                    below_avg_skills.push(skill);
                }
            })

            this.summary_alias_skills[person.alias] = {

                above : above_avg_skills,
                below : below_avg_skills,
                about : person.about

            }


        })

        //console.log(this.avg_data, this.summary_alias_skills);

        this.populate_tooltip('coldfooter');
        
    }

    populate_tooltip(alias) {

        const alias_data = this.summary_alias_skills[alias];

        document.querySelector('[data-tt-field="alias"]').innerText = alias;
        document.querySelector('[data-tt-field="about"]').innerText = alias_data.about;

        const above_cont = document.querySelector('.tt-above-avg-cont');
        const below_cont = document.querySelector('.tt-below-avg-cont');

        // cleans tags

        above_cont.innerHTML = '';
        below_cont.innerHTML = '';

        alias_data.above.forEach(skill => {

            const new_tag = document.createElement('span');
            new_tag.dataset.ttSkillTag = 'above';
            new_tag.innerText = skill;

            above_cont.appendChild(new_tag);

        })

        alias_data.below.forEach(skill => {

            const new_tag = document.createElement('span');
            new_tag.dataset.ttSkillTag = 'below';
            new_tag.innerText = skill;

            below_cont.appendChild(new_tag);

        })   

    }

    show_tooltip(e, tt) {
        console.log(e, e.target.__data__.alias);

        const alias = e.target.__data__.alias;

        tt.populate_tooltip(alias);

        const tt_w = +window.getComputedStyle(tt.ref).width.slice(0,-2);
        const tt_h = +window.getComputedStyle(tt.ref).height.slice(0,-2);

        const chart_w = tt.chart.w;
        const chart_h = tt.chart.h;

        if (e.x + tt_w + 10 <= chart_w) {
            tt.ref.style.left = (e.x + 10) + 'px';
        } else {
            console.log('here!!!', chart_w-e.x-10)
            tt.ref.style.right = (chart_w - e.x + 20) + 'px';
        }

        if (e.y + tt_h + 10 <= chart_h) {
            tt.ref.style.top = e.y
        } else if (e.y - tt_h - 10 < 0) {
            tt.ref.style.top = 10;
        } else {
            tt.ref.style.bottom = e.y - 10;
        }

        //console.log(e.x, e.y, tt_w, tt_h, chart_w, chart_h);

        tt.ref.classList.remove('hidden');
        
    }

}

class Chart {

    w;
    h;

    r = 10;

    margin = 30;
    marginY = 50;
    gap = 1;

    parallel_axis = {};

    // scales
    y_hist;
    x_hist;
    x_scatter;
    y;
    x_pc;

    data_params = {
        max_rank : null
    }

    x_axis;
    y_axis;

    axis_label_x;
    axis_label_y;

    ref = document.querySelector('.vis');

    svg = d3.select('.vis');

    cont = document.querySelector('.vis-container');

    chart_mode = 'none'; // 'histogram', 'scatter', 'parallel coordinates'

    constructor(data, skills) {

        this.data_params.max_rank = data.max_rank;

        this.axis_label_x = document.querySelector('.vis-axis-label-x');
        this.axis_label_y = document.querySelector('.vis-axis-label-y');

        this.make_scales();
        this.make_axis();
        this.make_parallel_axis(skills);

        console.log(this.w, this.h);
        console.log(this.x_hist(10));


    }

    get_sizes() {

        this.w = +window.getComputedStyle(this.ref).width.slice(0,-2);
        this.h = +window.getComputedStyle(this.cont).height.slice(0,-2);

        this.ref.setAttribute('viewBox', `0 0 ${this.w} ${this.h}`);

    }

    make_scales() {

        this.get_sizes();

        this.y_hist = d3.scaleLinear().domain([0,this.data_params.max_rank]).range([this.marginY + (this.data_params.max_rank) * this.r * 2 + (this.data_params.max_rank) * this.gap, this.marginY]);
        this.x_hist = d3.scaleLinear().domain([0,10]).range([this.margin, 10 * this.r * 2 + 10 * this.gap + this.margin]);
        this.x_scatter = d3.scaleLinear().domain([0,10]).range([this.margin, this.w - this.margin]);
        this.y = d3.scaleLinear().domain([0,10]).range([this.h - this.marginY, this.marginY]);

        this.x_pc = d3.scalePoint().domain([]).range([this.margin, this.w - this.margin]);

    }

    update_scale_pc(skills) {
        this.x_pc.domain(skills);
    }

    make_axis() {

        const x_axis = d3.axisBottom(this.x_hist);
        const y_axis = d3.axisLeft(this.y_hist);

        this.x_axis = this.svg
          .append('g')
          .classed('axis', true)
          .classed('hidden', true)
          .attr('transform', `translate(0,${this.y_hist.range()[0]})`)
          .call(x_axis)
        ;

        this.y_axis = this.svg
          .append('g')
          .classed('axis', true)
          .classed('hidden', true)
          .attr('transform', `translate(${this.margin}, 0)`)
          .call(y_axis)
        ;

    }

    show_axis(axis) {

        axis.classed('hidden', false)

    }

    show_axis_labels_histogram() {

        this.axis_label_x.classList.remove('vis-axis-label-hidden');
        this.axis_label_x.innerText = 'Proficiency';
        this.axis_label_y.classList.remove('vis-axis-label-hidden');
        this.axis_label_y.innerText = 'Number of students';

        this.axis_label_x.style.left = this.x_hist.range()[1] + 'px';
        this.axis_label_x.style.top = this.y_hist.range()[0] + 'px';

    }

    show_axis_labels_scatterplot(skills) {

        this.axis_label_x.classList.remove('vis-axis-label-hidden');
        this.axis_label_x.innerText = skills[0];
        this.axis_label_y.classList.remove('vis-axis-label-hidden');
        this.axis_label_y.innerText = skills[1];

        this.axis_label_x.style.left = this.x_scatter.range()[1] + 'px';
        this.axis_label_x.style.top = this.y.range()[0] + 'px';

    }

    show_axis_labels_pc() {

        this.axis_label_x.classList.add('vis-axis-label-hidden');
        this.axis_label_y.innerText = 'Proficiency';


    }

    update_axis() {

        let x_axis, y_axis, translation;

        if (this.chart_mode == 'scatter') {

            x_axis = d3.axisBottom(this.x_scatter);
            y_axis = d3.axisLeft(this.y);

            translation = this.y.range()[0];

            this.x_axis.classed('no-line', false);

        }

        if (this.chart_mode == 'histogram') {

            x_axis = d3.axisBottom(this.x_hist);
            y_axis = d3.axisLeft(this.y_hist);

            translation = this.y_hist.range()[0];

            this.show_axis_labels_histogram();

            this.x_axis.classed('no-line', false);

        }

        if (this.chart_mode == 'parallels coordinates') {

            x_axis = d3.axisBottom(this.x_pc);
            y_axis = d3.axisLeft(this.y);

            translation = this.y.range()[0];

            this.x_axis.classed('no-line', true);

        }

        this.x_axis
          .transition()
          .duration(500)
          .attr('transform', `translate(0,${translation})`)
          .call(x_axis)
        ;

        this.y_axis
          .transition()
          .duration(500)
          .call(y_axis)
        ;

    }

    make_parallel_axis(skills) {

        skills.forEach(skill => {

            const pc_axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');

            pc_axis.classList.add('pc-axis', 'pc-axis-hidden');
            pc_axis.dataset.axisSkill = skill;
            pc_axis.setAttribute('x1', this.margin);
            pc_axis.setAttribute('x2', this.margin);
            pc_axis.setAttribute('y1', this.marginY);
            pc_axis.setAttribute('y2', this.y.range()[0]);
            pc_axis.setAttribute('transform-origin', `${this.margin} ${this.y.range()[0]}`);

            this.ref.appendChild(pc_axis);

        })

    }

    hide_all_parallel_axis() {

        document.querySelectorAll('.pc-axis').forEach(el => {
            
            el.classList.add('pc-axis-hidden');
            el.setAttribute('transform', '');
            
        });

    }

    update_parallel_axis(skills) {

        this.hide_all_parallel_axis();
        
        // starting from index 1, because the first skill is mapped over the regular y-axis, so no need for an extra parallel axis
        skills.slice(1).forEach(skill => {

            const pc_axis = document.querySelector(`[data-axis-skill="${skill}"]`);

            pc_axis.classList.remove('pc-axis-hidden');
            pc_axis.setAttribute('transform', `translate(${this.x_pc(skill) - this.margin}, 0)`);

        })

    }

}