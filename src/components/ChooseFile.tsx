import { React } from "./../deps.ts";

type Props = {
  onChoose: (text: string) => void;
};

export const ChooseFile: React.VFC<Props> = ({ onChoose }) => {
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { files } = ev.target;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    // I assume this is a text file
    void file.text()
      .then((text) => {
        onChoose(text);
      });
  };
  return (
    <div className="file is-boxed">
      <label className="file-label">
        <input
          className="file-input"
          type="file"
          name="logs"
          onChange={onFileChange}
        />
        <span className="file-cta">
          <span className="file-icon">
            <i className="fas fa-upload"></i>
          </span>
          <span className="file-label">
            Choose an appium log file
          </span>
        </span>
      </label>
    </div>
  );
};
