import React, { useState, useEffect } from "react";
import './StarRating.css';

const StarRating = ({total, value, onRatingChange, onRatingReset}) => {
    const [rating, setRating] = useState(value);
    const [hover, setHover] = useState(value);
    useEffect(() => { setRating(value) }, [value]);
    return (
		<div className="star-rating" >
			{[...Array(total)].map((star, index) => {
				index += 1;
				return (
					<button
					type="button"
					key={index}					
					className={index <= ((rating && hover) || rating || hover) ? "on" : "off"}
					onClick={() => {
						setRating(index); 
						if(onRatingChange) {
							onRatingChange(index); 
						}
					}}
					onDoubleClick={() => {
						setRating(0);
						setHover(0);
						if(onRatingReset) {
							onRatingReset(0);
						}
					}}
					onMouseEnter={() => setHover(index)}
					onMouseLeave={() => setHover(rating)}
					>
					<span className="star">&#9733;</span>
					</button>
				);
			})}
		</div>
    );
};
export default StarRating;