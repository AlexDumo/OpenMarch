import { useCallback, useEffect, useRef, useState } from "react";
import { HASHES, YARD_LINES } from "../../Constants";
import { useSelectedMarcher } from "../../context/SelectedMarcherContext";
import { ReadableCoords, FieldProperties } from "../../Interfaces";
import { canvasCoordsToCollegeRCords, getTerseString } from "../../utilities/CoordsUtils";
import { useMarcherPageStore } from "../../stores/Store";
import { useSelectedPage } from "../../context/SelectedPageContext";
import { getFieldProperties } from "@/api/api";

function MarcherEditor() {
    const { selectedMarcher } = useSelectedMarcher()!;
    const [rCoords, setRCoords] = useState<ReadableCoords>();
    const { marcherPages } = useMarcherPageStore()!;
    const { selectedPage } = useSelectedPage()!;

    const coordsFormRef = useRef<HTMLFormElement>(null);
    const xInputRef = useRef<HTMLInputElement>(null);
    const xDescriptionRef = useRef<HTMLSelectElement>(null);
    const yardLineRef = useRef<HTMLSelectElement>(null);
    const fieldSideRef = useRef<HTMLSelectElement>(null);
    const yInputRef = useRef<HTMLInputElement>(null);
    const yDescriptionRef = useRef<HTMLSelectElement>(null);
    const hashRef = useRef<HTMLSelectElement>(null);
    const detailsFormRef = useRef<HTMLFormElement>(null);

    const fieldProperties = useRef<FieldProperties>();

    useEffect(() => {
        getFieldProperties().then((fieldPropertiesResult) => {
            fieldProperties.current = fieldPropertiesResult;
        });
    }, []);

    const handleCoordsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // const form = event.currentTarget;
        // const xSteps = form[xInputId].value;
        // const xDescription = form[xDescriptionId].value;
        // const yardLine = form[yardLineId].value;
        // const fieldSide = form[fieldSideId].value;
    }

    useEffect(() => {
        setRCoords(undefined);
        const marcherPage = marcherPages.find(marcherPage => marcherPage.marcher_id === selectedMarcher?.id &&
            marcherPage.page_id === selectedPage?.id);
        if (marcherPage) {
            if (!fieldProperties.current) return;
            const newRcoords = canvasCoordsToCollegeRCords(marcherPage.x, marcherPage.y, fieldProperties.current);
            setRCoords(newRcoords);
        }
    }, [selectedMarcher, marcherPages, selectedPage]);

    const resetForm = useCallback(() => {
        coordsFormRef.current?.reset();

        if (rCoords) {
            if (xInputRef.current) xInputRef.current.value = rCoords.xSteps.toString();
            if (xDescriptionRef.current) xDescriptionRef.current.value = rCoords.xDescription;
            if (yardLineRef.current) yardLineRef.current.value = rCoords.yardLine.toString();
            if (fieldSideRef.current) fieldSideRef.current.value = rCoords.side.toString();
            if (yInputRef.current) yInputRef.current.value = rCoords.ySteps.toString();
            if (yDescriptionRef.current) yDescriptionRef.current.value = rCoords.yDescription;
            if (hashRef.current) hashRef.current.value = rCoords.hash;
        }

        detailsFormRef.current?.reset();
    }, [rCoords]);

    // Reset the form when the selected page changes so the values are correct
    useEffect(() => {
        resetForm();
    }, [selectedMarcher, rCoords, resetForm]);

    return (
        <>{selectedMarcher && (<div className="marcher-editor editor">
            <h3 className="header">
                <span>Marcher</span>
                <span>{selectedMarcher.drill_number}</span>
            </h3>
            <h4>Coordinates</h4>
            {!rCoords ? <p style={{ color: "white" }}>Error loading coordinates</p> :
                <form className="coords-editor edit-group" ref={coordsFormRef} onSubmit={handleCoordsSubmit}>
                    <label htmlFor="xInput">X</label>
                    <div className="input-group">
                        {/* Maybe on change of all of the variables updating, but only when clicking off for the steps */}
                        <input disabled={true} type="number" defaultValue={rCoords?.xSteps} ref={xInputRef} />
                        <select disabled={true} defaultValue={rCoords.xDescription} ref={xDescriptionRef}>
                            <option value="inside">in</option>
                            <option value="outside">out</option>
                            <option value="on">on</option>
                        </select>
                        <select disabled={true} ref={yardLineRef} defaultValue={rCoords.yardLine}>
                            {YARD_LINES.map((yardLine) => (
                                <option value={yardLine} key={yardLine}>{yardLine}</option>
                            ))}
                        </select>
                        <select disabled={true} ref={fieldSideRef} defaultValue={rCoords.side}>
                            <option value="1">S1</option>
                            <option value="2">S2</option>
                        </select>
                    </div>
                    <label htmlFor="yInput">Y</label>
                    <div className="input-group">
                        <input disabled={true} type="number" value={rCoords?.ySteps} ref={yInputRef} />
                        <select disabled={true} value={rCoords.yDescription} ref={yDescriptionRef}>
                            <option value="in front of">front</option>
                            <option value="behind">behind</option>
                            <option value="on">on</option>
                        </select>
                        <select disabled={true} ref={hashRef}>
                            {HASHES.map((hash) => (
                                <option value={hash} key={hash}>{getTerseString(hash)}</option>
                            ))}
                        </select>
                    </div>
                    {/* This is here so the form submits when enter is pressed */}
                    <button type="submit" style={{ display: 'none' }}>
                        Submit
                    </button>
                </form>
            }
            <h4>Details</h4>
            <form className="marcher-details-editor edit-group" ref={detailsFormRef}>
                <div className="input-group">
                    <label htmlFor="name-input">Name</label>
                    <input type="text"
                        value={(selectedMarcher.name.length < 1 || selectedMarcher.name === " ") ? "-"
                            : selectedMarcher.name} disabled={true} id="name-input" />
                </div>
                <div className="input-group">
                    <label htmlFor="section-input">Section</label>
                    <input type="text" value={selectedMarcher.section} disabled={true} id="section-input" />
                </div>
                <div className="input-group">
                    <label htmlFor="drill-number-input">Drill Number</label>
                    <input type="text" value={selectedMarcher.drill_number} disabled={true} id="drill-number-input" />
                </div>
                {/* <label htmlFor="counts-input">Counts</label>
                <input type="number" value={selectedMarcher.counts} onChange={undefined} id="counts-input" /> */}
                {/* This is here so the form submits when enter is pressed */}
                <button type="submit" style={{ display: 'none' }}>
                    Submit
                </button>
            </form>
        </div>)
        }</>
    );
}

export default MarcherEditor;
