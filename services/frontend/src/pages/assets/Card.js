// IMPT NOT IN USE

import { eventToStatus } from '../../config';

export default function Card({device}) {
    return (<div className="card--devices" data-asset-id={device.assetId} key={device.assetId}>
        <a className="card--devices__details" href={`{ASSET_HOMEPAGE_URL}views/show_device#${device.assetId}`}>
            <h2 className="card--devices__details--asset-tag">{device.assetTag}</h2>
            <h5 className="card--devices__details--serial-number">{device.serialNumber}</h5>
            <h5 className="card--devices__details--model-name">{device.modelName}</h5>
        </a>

        <div className="card--devices__status">
            <h3 className="card--devices__status-header">Status</h3>
            <span className={`card--devices__status--status ${device.status === 'loaned' ? 'unavailable' : 'available'}`}>
                {eventToStatus(device.status)}
            </span>
            {device.status === 'loaned' && (
                <>
                    <h4 className="card--devices__status-header--user">User</h4>
                    <a className="btn-text--user" href={`views/show_user#${device.userId}`}>
                        <span className="card--devices__status--user">{device.userName}</span>
                    </a>
                </>
            )}
        </div>

        <button className="btn--round btn--round--absolute">
            <svg>
                <use href={`../../logo.svg#icon-bookmark${device.bookmarked === 1 ? '-fill' : ''}`}></use>
            </svg>
        </button>
    </div>)
}