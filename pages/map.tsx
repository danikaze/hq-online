import { AppPage } from './_app';
import { makeStyles } from '@material-ui/core/styles';
import { CanvasMap } from '@components/canvas-map';
import { clearMap, initMap, resizeMap } from '@utils/map';

const useStyles = makeStyles({
  canvas: {
    display: 'flex',
    width: '100%',
    height: '100%',
    minHeight: '100%',
  },
});

const MapPage: AppPage = ({ logger }) => {
  const { canvas } = useStyles();

  return (
    <CanvasMap
      className={canvas}
      onMount={initMap}
      onResize={resizeMap}
      onUnmount={clearMap}
    />
  );
};

MapPage.defaultProps = {
  namespacesRequired: [],
};

export default MapPage;
