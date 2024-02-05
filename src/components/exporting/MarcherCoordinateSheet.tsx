import * as Interfaces from "@/global/Interfaces";
import { useMarcherPageStore, usePageStore } from "@/global/Store";
import { Row, Table } from "react-bootstrap";
import * as CoordsUtils from '@/utilities/CoordsUtils';
import { useFieldProperties } from "@/context/fieldPropertiesContext";
import { useEffect, useState } from "react";

interface MarcherCoordinateSheetProps {
    marcher?: Interfaces.Marcher;
    includeMeasures?: boolean;
    /**
     * The denominator to round to. 4 -> 1/4 = nearest quarter step. 10 -> 1/10 = nearest tenth step.
     */
    roundingDenominator?: number;
    /**
     * Whether this is a printing preview or an example for the user to see.
     */
    example?: boolean;
    /**
     * True if the coordinate strings should be terse. False if they should be verbose.
     * Default is false.
     *
     * X: "S1: 2 out 45" vs "S1: 2 steps outside 45 yard line."
     *
     * Y: "5 BFSL" vs "5 steps behind front sideline.
     */
    terse?: boolean;
    /**
     * Whether to use X/Y as header rather than "Side to Side" and "Front to Back".
     */
    useXY?: boolean;
}

export default function MacherCoordinateSheet(
    { marcher, includeMeasures = true, roundingDenominator = 4,
        example = false, terse = false, useXY = false }: MarcherCoordinateSheetProps) {
    const { marcherPages } = useMarcherPageStore()!;
    const { pages } = usePageStore()!;
    const { fieldProperties } = useFieldProperties()!;
    const [marcherToUse, setMarcherToUse] = useState<Interfaces.Marcher>();
    const [pagesToUse, setPagesToUse] = useState<Interfaces.Page[]>([]);
    const [marcherPagesToUse, setMarcherPagesToUse] = useState<Interfaces.MarcherPage[]>([]);

    useEffect(() => {
        if (example && fieldProperties) {
            setMarcherToUse({
                id: 1, name: "Example Marcher", drill_number: "B1", section: "Baritone",
                id_for_html: "example-marcher", drill_prefix: "B", drill_order: 1
            });
            setPagesToUse([
                { id: 1, name: "1", counts: 8, order: 1, id_for_html: "example-page-1" },
                { id: 2, name: "2", counts: 16, order: 2, id_for_html: "example-page-2" },
                { id: 3, name: "2A", counts: 5, order: 3, id_for_html: "example-page-3" },
            ]);
            setMarcherPagesToUse([
                {
                    id: 1, marcher_id: 1, page_id: 1, id_for_html: "example-marcher-page-1",
                    x: fieldProperties.originX, y: fieldProperties.originY,
                },
                {
                    id: 2, marcher_id: 1, page_id: 2, id_for_html: "example-marcher-page-2",
                    x: fieldProperties.originX + (2 * fieldProperties.pixelsPerStep),
                    y: fieldProperties.originY + (2 * fieldProperties.pixelsPerStep),
                },
                {
                    id: 3, marcher_id: 1, page_id: 3, id_for_html: "example-marcher-page-3",
                    x: fieldProperties.originX - (5.25 * fieldProperties.pixelsPerStep),
                    y: fieldProperties.originY + ((fieldProperties.frontSideline * fieldProperties.pixelsPerStep) - (2.5 * fieldProperties.pixelsPerStep))
                },
            ]);
        } else {
            setMarcherToUse(marcher);
            setPagesToUse(pages);
            setMarcherPagesToUse(marcherPages);
        }
    }, [marcher, marcherPages, pages, example]);

    return (
        <StaticMarcherCoordinateSheet marcher={marcherToUse!} pages={pagesToUse} marcherPages={marcherPagesToUse}
            fieldProperties={fieldProperties!} includeMeasures={includeMeasures} roundingDenominator={roundingDenominator}
            example={example} terse={terse} useXY={useXY} />
    );
}

interface StaticCoordinateSheetProps {
    marcher: Interfaces.Marcher;
    pages: Interfaces.Page[];
    marcherPages: Interfaces.MarcherPage[];
    fieldProperties: Interfaces.FieldProperties;
    includeMeasures?: boolean;
    /**
     * The denominator to round to. 4 -> 1/4 = nearest quarter step. 10 -> 1/10 = nearest tenth step.
     */
    roundingDenominator?: number;
    /**
     * Whether this is a printing preview or an example for the user to see.
     */
    example?: boolean;
    /**
     * True if the coordinate strings should be terse. False if they should be verbose.
     * Default is false.
     *
     * X: "S1: 2 out 45" vs "S1: 2 steps outside 45 yard line."
     *
     * Y: "5 BFSL" vs "5 steps behind front sideline.
     */
    terse?: boolean;
    /**
     * Whether to use X/Y as header rather than "Side to Side" and "Front to Back".
     */
    useXY?: boolean;
}

export function StaticMarcherCoordinateSheet({
    marcher, fieldProperties, marcherPages, pages, includeMeasures = true, roundingDenominator = 4,
    terse = false, useXY = false }: StaticCoordinateSheetProps) {

    const sortMarcherPages = (a: Interfaces.MarcherPage, b: Interfaces.MarcherPage) => {
        const pageA = pages.find((page) => page.id === a.page_id);
        const pageB = pages.find((page) => page.id === b.page_id);
        return pageA && pageB ? pageA.order - pageB.order : 0;
    }
    return (
        <div>
            <Row>
                {!fieldProperties || !marcher || pages.length === 0 || marcherPages.length === 0 ?
                    <>
                        <h5>Error exporting coordinate sheet</h5>
                        {!fieldProperties && <p>No field properties provided</p>}
                        {!marcher && <p>No marcher provided</p>}
                        {pages.length === 0 && <p>No pages provided</p>}
                        {marcherPages.length === 0 && <p>No marcher pages provided</p>}
                    </>
                    :
                    <Table striped size="sm">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Counts</th>
                                {includeMeasures && <th>Measure</th>}
                                <th>{useXY ? "X" : "Side to Side"}</th>
                                <th>{useXY ? "Y" : "Front to Back"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marcherPages.filter((marcherPage) => marcherPage.marcher_id === marcher.id).sort(sortMarcherPages)
                                .map((marcherPage) => {
                                    if (!fieldProperties) return null;

                                    const page = pages.find((page) => page.id === marcherPage.page_id);
                                    const rCoords = CoordsUtils.canvasCoordsToCollegeRCords(marcherPage.x, marcherPage.y, fieldProperties);

                                    if (!page || !rCoords) return null;

                                    rCoords.xSteps = Math.round(rCoords.xSteps * roundingDenominator) / roundingDenominator;
                                    rCoords.ySteps = Math.round(rCoords.ySteps * roundingDenominator) / roundingDenominator;

                                    return (
                                        <tr key={marcherPage.id_for_html}>
                                            <td>{page.name}</td>
                                            <td>{page.counts}</td>
                                            {includeMeasures && <td>N/A</td>}
                                            <td>{terse ? CoordsUtils.getTerseStringX(rCoords) : CoordsUtils.getVerboseStringX(rCoords)}</td>
                                            <td>{terse ? CoordsUtils.getTerseStringY(rCoords) : CoordsUtils.getVerboseStringY(rCoords)}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </Table>}
            </Row>
        </div>
    );
}
