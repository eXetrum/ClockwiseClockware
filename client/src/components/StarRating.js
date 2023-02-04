import React, { useState, useEffect } from "react";
import './StarRating.css';

const StarRating = ({total=5, value=0, readonly=false, onRatingChange=null, onRatingReset=null}) => {
    const [rating, setRating] = useState(value);
    const [hover, setHover] = useState(value);
    useEffect(() => { setRating(value); setHover(value); }, [value]);
	
    return (
		<div className="star-rating" >
			{[...Array(total)].map((star, index) => {
				index += 1;
				return (
					<button
					type="button"
					key={index}					
					className={index <= ((rating && hover) || hover) ? "on" : "off"}
					onClick={() => {
						if(readonly) return;
						setRating(index); 
						if(onRatingChange) {
							onRatingChange(index); 
						}
					}}
					onDoubleClick={() => {
						if(readonly) return;
						setRating(0);
						setHover(0);
						if(onRatingReset) {
							onRatingReset(0);
						}
					}}
					onMouseEnter={() => {
						if(readonly) return;
						setHover(index)
					}}
					onMouseLeave={() => {
						if(readonly) return;
						setHover(rating)
					}}
					>
					<span className="star">&#9733;</span>
					</button>
				);
			})}
		</div>
    );
};
export default StarRating;