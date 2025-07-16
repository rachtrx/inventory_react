import { useEffect, useState } from "react";
import { AccItemsList } from "../utils/popovers/ItemsList"

export const LoansPopover = ({ accessoryType, searchFunc, count }) => {

    const [loans, setLoans] = useState([]);

    const fetchLoans = async () => {
        try {
            const response = await searchFunc(accessoryType.accessoryTypeId)
            const loanData = response.data
            console.log(loanData);
            setLoans(loanData);
        } catch (err) {
            console.error('Error fetching loan/reservation data:', err);
        }
    }

    return (
        <AccItemsList
            loans={loans || []}
            circleText={count || 0}
            onClick={fetchLoans}
        />
    )
}