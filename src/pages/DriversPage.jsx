import AddDriver from '../components/drivers/AddDriver';
import DriverList from '../components/drivers/DriverList';

const DriversPage = () => {
    return (
        <div className="space-y-6">
            <AddDriver />
            <DriverList />
        </div>
    );
};

export default DriversPage;
