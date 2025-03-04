import BarIndicator from "@/app/components/unit/BarIndicator";
import VectorIndicator from "@/app/components/unit/VectorIndicator";
import Icon from "@/app/components/unit/Icon";

export const CharacterDetails = ({ charData }: any) => {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="bg-gray-900 shadow-lg rounded-xl p-6 w-full max-w-md">
        <div className="mb-4 text-center">
          <span className="block text-6xl font-bold">{charData?.name}</span>
        </div>

        <div className="flex mb-4">
          <div>
            <BarIndicator
              label="LIFE"
              value={Number(charData?.life) / 10}
              barColor="bg-green-500"
            />
            <BarIndicator
              label="ATK"
              value={Number(charData?.attack)}
              barColor="bg-red-500"
            />
            <BarIndicator
              label="SPD"
              value={Number(charData?.speed)}
              barColor="bg-blue-500"
            />
          </div>
          <div className="flex ml-6">
            <span>VEC</span>
            <VectorIndicator arrow={charData?.vector ?? 0} />
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <div className="flex flex-col items-center">
            <Icon name={charData?.skill_name ?? ""} />
            <div className="text-sm text-center mt-2">
              {charData?.skill_name}
            </div>
            <div className="text-xs text-center mt-2 max-w-40">
              {charData?.skill_desc}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Icon name={charData?.special_name ?? ""} />
            <div className="text-sm text-center mt-2">
              {charData?.special_name}
            </div>
            <div className="text-xs text-center mt-2 max-w-40">
              {charData?.special_desc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
