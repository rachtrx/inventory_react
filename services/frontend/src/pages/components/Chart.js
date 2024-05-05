export default function Chart({type, name, children}) {
    return (
        <div class={`stats stats--${type}`}>
            <div class={`stats-body--${name}`}>
                <h2>Users by Departments</h2>
                <hr />
                {...children}
            </div>
        </div>
    )
}