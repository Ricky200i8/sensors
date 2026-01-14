import { useEffect, useState } from 'react';
import { SensorService } from './accelerometer.service';

interface AccelerometerData {
    x: number;
    y: number;
    z: number;
}

export const useAccelerometer = () => {
    const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        const subscription = SensorService.subscribe((newData: AccelerometerData) => {
            setData(newData);
        });

        return () => {
            SensorService.unsubscribe(subscription);
        };
    }, []);

    return data;
};
