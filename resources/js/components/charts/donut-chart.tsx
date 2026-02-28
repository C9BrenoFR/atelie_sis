import { PieValueType } from '@mui/x-charts';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';



const settings = {
    margin: { right: 5 },
    width: 200,
    height: 200,
    hideLegend: true,
};

const StyledText = styled('text')({
    fill: 'var(--foreground)',
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 20,
});

interface PieCenterLabelProps {
    children: React.ReactNode;
}

function PieCenterLabel({ children }: PieCenterLabelProps): React.ReactElement {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}

interface DonutCharProps {
    data: PieValueType[]
    label: string | number
}

export default function DonutChart({ data, label }: DonutCharProps) {

    return (
        <PieChart
            series={[{ innerRadius: 50, outerRadius: 100, data, arcLabel: 'value' }]}
            {...settings}
        >
            <PieCenterLabel>{label}</PieCenterLabel>
        </PieChart>
    );
};
