import AddRoute from '../components/routes/AddRoute';
import RouteList from '../components/routes/RouteList';

const RoutesPage = () => {
    return (
        <div className="space-y-6">
            <AddRoute />
            <RouteList />
        </div>
    );
};

export default RoutesPage;
