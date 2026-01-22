import React from 'react';

const Divider = () => {
    const imageUrl = "/Wedding/images/divider.png";

    return (
        <div className="w-full bg-theme-bg py-2 overflow-hidden">
            <div
                className="w-full h-5"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center'
                }}
            />
        </div>
    );
};

export default Divider;
