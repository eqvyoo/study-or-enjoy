//@ts-check
/* eslint-disable no-unused-vars */
/*
[
    {
        'course_name': 'name'
        'due_date': '2022-05-15T14:59:59Z'
        'assignment_name': '과제이름'
        'points': 10.0
    }
]
*/

const ADayForMS = 1000 * 60 * 60 * 24

async function is_possible_schedule(date, assignments) {
    const assignments_dates = assignments.map(it => [new Date(it.due_date), it])
    const is_disqualified = assignments_dates.filter(it => {
        const current_timestamp = date.getTime()
        const target_timestamp = it[0].getTime()

        return current_timestamp > (target_timestamp - ADayForMS * 2)  
    })
    
    console.log(is_disqualified)

    if(is_disqualified.length > 0) {
        const disq = is_disqualified.at(0)
        return `${disq[1].course_name}: ${disq[1].assignment_name} [${disq[1].points} 점]`
    } else {
        return null
    }
}

module.exports.is_possible_schedule = is_possible_schedule