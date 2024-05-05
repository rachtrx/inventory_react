function InfoBar({count}) {
    return (
        <div className="devices-filter-options">
            <button className="btn-filter btn-filter--bookmarks"></button>
            <h5 className="devices-filter__count">{count}</h5>
        </div>
    )
}

export default InfoBar