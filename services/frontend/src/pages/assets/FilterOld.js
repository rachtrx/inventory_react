function Filter({filters}) {    

    return (<div className="devices">
        <div className="devices-header-container">
            <h1 className="heading-1">Devices</h1>
            <button className="btn btn--export-excel--devices">Export to Excel</button>
        </div>

        <form className="devices-filter">
            <div className="filter__group--device-type">
                <h5 className="filter-header filter-header--device-type">Device Type</h5>
                <select name="deviceType" className="form__input form__input--device-type">
                    <option selected>All</option>
                    {(filters?.["device_types"] ?? []).map((value, index) => (
                        <option key={index} value={value}>{value}</option>
                    ))}
                </select>
            </div>

            <div className="filter__group--model-name">
                <h5 className="filter-header filter-header--model-name">Model Name</h5>
                <input type="text" className="form__input form__input--model-name" name="modelName" placeholder="All" autocomplete="off" />
                {/* DROPDOWN SUGGESTIONS ABSOLUTE POSITIONING*/}
                <div className="form-dropdown form-dropdown--model-name filter-dropdown hidden-visibility">
                    <div className="preview preview--model-name"></div>
                </div>
            </div>

            <div className="filter__group--vendor">
                <h5 className="filter-header filter-header--vendor">Vendor</h5>
                <select name="vendorName" className="form__input form__input--vendor" required>
                    <option selected>All</option>
                    {(filters?.["vendors"] ?? []).map((value, index) => (<option key={index} value={value}>{value}</option>))}
                </select>
            </div>

            <div className="filter__group--status">
                <h5 className="filter-header filter-header--status">Status</h5>
                <select name="status" className="form__input form__input--status" required>
                    <option selected>All</option>
                    <option value="available">Available</option>
                    <option value="loaned">On Loan</option>
                </select>
            </div>

            <div className="filter__group--location">
                <h5 className="filter-header filter-header--location">Location</h5>
                <select name="location" className="form__input form__input--location" required>
                    <option selected>All</option>
                    {(filters?.["locations"] ?? []).map((value, index) => (<option key={index} value={value}>{value}</option>))}
                </select>
            </div>

            <div className="filter__group--age">
                <h5 className="filter-header filter-header--age">Device Age</h5>
                <select name="deviceAge" className="form__input form__input--age" required>
                    <option selected>All</option>

                    {(filters?.["ages"] ?? []).map((value, index) => (<option key={index} value={value}>{value}</option>))}
                </select>
            </div>

            <div className="filter__group--search">
                <h5 className="filter-header filter-header--search">Serial Number / Asset Tag</h5>
                <input type="text" name="id" className="form__input form__input--search" autocomplete="off" placeholder="All" />
            </div>

            <div className="filter__group--btns filter__group--btns--devices">
                <button type="reset" className="btn btn-filter btn-filter--reset btn-filter--reset--devices">Reset</button>
                <button type="submit" className="btn btn-filter btn-filter--submit btn-filter--submit--devices">Search</button>
            </div>
        </form>
    </div>)
}

export default Filter