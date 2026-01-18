import React from 'react';

const Divider = () => {
    const imageUrl = "https://lh3.google.com/u/0/d/126dB0r9U2lHBPSzFPM1KELgFhYcUwbZi=w1920-h868-iv1?auditContext=prefetch";

    return (
        <div className="w-full bg-theme-bg py-6 overflow-hidden">
            <div
                className="w-full h-10"
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
